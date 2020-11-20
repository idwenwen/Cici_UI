import { each, getLast, UUID } from "@cc/tools";
import Action, { getAction } from "./action";
import Player from "./player";
import {
  atomAction,
  callback,
  Combinable,
  findIndexCompare,
  player,
  timeStep,
  actable,
} from "./typeDeclare";
import { isNil, isFunction, toArray } from "lodash";
import Parallel from "./parallel";
import { toActable } from "./index";

const ChainId = new UUID((origin) => `Chain_${origin}`);

/**
 * Multiple atom-action for estimated plan of variable updating.
 */
class Chain extends Player {
  static BasicSetting = Action.BasicSetting;
  uuid: string;
  atoms: Array<Action | Chain | Parallel>;
  cb: callback[];

  /**
   * Connecting each milestone automatically
   * @param milestone {atomAction[]} Each item implies to on Action, First on really need to have condition
   */
  constructor(
    milestone: (atomAction | actable | (atomAction | actable)[])[],
    repeat: boolean = false,
    cb?: callback | callback[]
  ) {
    super(repeat);
    this.uuid = ChainId.get().toString();
    this.atoms = [];
    this.push(milestone);
    this.cb = cb ? toArray(cb) : [];
  }

  act(callbackable: callback | callback[] = []): player {
    this.ready();
    let current = 0;
    let currentAction = null;
    let currentPlayer = null;

    let finishingAll = false;
    let endingAll = false;
    let willRepeat = this.repeat;
    callbackable = toArray(callbackable).push(...this.cb);
    return (timeStemp: timeStep): boolean => {
      this.endingAll(() => {
        this.end();
        endingAll = true;
        willRepeat = false;
      });
      this.ending(() => {
        currentAction.end();
      });
      if (currentPlayer === null) {
        currentAction = this.atoms[current];
        currentPlayer = currentAction ? currentAction.act(callbackable) : null;
        if (isNil(currentPlayer)) {
          return false;
        }
      }
      this.pausing(() => {
        currentAction.pause();
      });
      this.continuing(() => {
        currentAction.continue();
      });

      // Expected finishAll milestones quickly
      this.finishingAll(() => {
        finishingAll = true;
      });
      if (finishingAll) {
        this.finish();
      }
      this.finishing(() => {
        currentAction.finish();
      });

      // Run action
      if (currentPlayer(timeStemp)) {
        return true;
      } else {
        if (this.isPausing) {
          return false;
        }
        // Is executing endingAll-operation ?
        if (!endingAll) {
          current += 1;
          currentAction = null;
          currentPlayer = null;
          return (this.isFinish = current < this.atoms.length);
        } else {
          current = 0;
          currentAction = null;
          currentPlayer = null;
          if (!willRepeat) {
            this.isFinish = true;
            return false;
          } else {
            finishingAll = false;
            endingAll = false;
            willRepeat = this.repeat;
            return true;
          }
        }
      }
    };
  }

  push(actable: atomAction | actable, index?: number | findIndexCompare);
  push(
    actable: (atomAction | actable | (atomAction | actable)[])[],
    index?: number | findIndexCompare
  );
  push(actable: Combinable, index: Combinable) {
    const pos = <number>(
      (isFunction(index)
        ? this.atoms.findIndex(<findIndexCompare>index) + 1
        : isNil(index)
        ? this.atoms.length
        : index)
    );
    actable = toArray(actable);
    const willAddList = each(actable)((atom) => {
      return toActable(atom, false);
    });
    this.atoms.splice(pos, 0, ...willAddList);
  }

  pop(index?: number | findIndexCompare, count: number = 1) {
    if (isNil(index)) {
      return count === 1
        ? this.atoms.pop()
        : this.atoms.splice(this.atoms.length - count);
    } else {
      const pos = <number>(
        (isFunction(index)
          ? this.atoms.findIndex(<findIndexCompare>index) + 1
          : index)
      );
      return this.atoms.splice(pos, count);
    }
  }

  callback(cb: callback | callback[]) {
    this.cb.push(...toArray(cb));
  }

  callbackReplace(cb: callback | callback[]) {
    this.cb = toArray(cb);
  }
}

export default Chain;
