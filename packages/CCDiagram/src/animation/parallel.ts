import { each, Mapping, UUID } from "@cc/tools";
import Action, { getAction } from "./action";
import Chain from "./chain";
import Player from "./player";
import {
  actable,
  atomAction,
  callback,
  Combinable,
  findIndexCompare,
  player,
  timeStep,
} from "./typeDeclare";
import { toArray, isNil, isFunction, flatten } from "lodash";
import { toActable } from "./index";

const ParallelId = new UUID((origin) => `Parallel_${origin}`);

/**
 * Multiple Chain, Action or Parallel combine to an parallel lisst
 * Parallel instance will use to manage multiple actions
 */
class Parallel extends Player {
  static BasicSetting = Chain.BasicSetting;
  atoms: Array<Chain | Action | Parallel>;
  uuid: string;

  repeat: boolean;
  cb: callback[];

  constructor(
    config: (atomAction | actable | (atomAction | actable)[])[],
    repeat: boolean = false,
    cb?: callback[] | callback
  ) {
    super(repeat);
    this.atoms = [];
    this.push(config);
    this.uuid = ParallelId.get().toString();
    this.cb = cb ? toArray(cb) : [];
  }

  finishAll() {
    this.willFinish = true;
  }

  endAll() {
    this.willEnd = true;
  }

  act(callbackable: callback | callback[] = []) {
    this.ready();
    let runningChain: Mapping<number, player> = new Mapping();
    let finished = [];
    let willRepeat = this.repeat;
    callbackable = toArray(callbackable).push(...this.cb);
    return (timestep: timeStep) => {
      this.ending(() => {
        each(this.atoms)((val) => {
          val.endAll();
        });
      });
      this.pausing(() => {
        each(this.atoms)((val) => {
          val.pause();
        });
      });
      this.continuing(() => {
        each(this.atoms)((val) => {
          val.continue();
        });
      });
      this.finishing(() => {
        each(this.atoms)((val) => {
          val.finishAll();
        });
      });
      // The current round of animation is completed
      each(this.atoms)((chain: Chain, index) => {
        if (!finished.find((pos) => pos === index)) {
          let chainPlayer = runningChain.get(index) || chain.act(callbackable);
          const result = chainPlayer(timestep);
          if (!result && chain.isFinish) {
            finished.push(index);
          }
        }
      });
      if (finished.length === this.atoms.length) {
        if (!willRepeat) {
          // If this animation will not repeat
          this.isFinish = true;
          return false;
        } else {
          // will repeat,
          this.ready();
          runningChain.clear();
          finished = [];
        }
      }
    };
  }

  push(actable: (atomAction | actable | (atomAction | actable)[])[]);
  push(actable: atomAction | actable | (atomAction | actable)[]);
  push(actable: Combinable) {
    actable = flatten(toArray(actable));
    const willAddList = each(actable)((atom) => {
      return toActable(atom);
    });
    this.atoms.push(...(<actable[]>willAddList));
  }

  pop(index?: number | findIndexCompare) {
    if (isNil(index)) {
      return this.atoms.pop();
    } else {
      const pos = <number>(
        (isFunction(index)
          ? this.atoms.findIndex(<findIndexCompare>index) + 1
          : index)
      );
      return this.atoms.splice(pos, 1);
    }
  }

  callback(cb: callback | callback[]) {
    this.cb.push(toArray[cb]);
  }

  callbackReplace(cb: callback | callback[]) {
    this.cb = toArray(cb);
  }
}

export default Parallel;
