import { each, Exception, Mapping } from "@cc/tools";
import Action, { getAction, copyInstance as copyAction } from "./action";
import Chain, { copyInstance as copyChain } from "./chain";
import Player from "./player";
import {
  actable,
  animationInit,
  atomAction,
  callback,
  Combinable,
  player,
  typeDictionary,
} from "./typeDeclare";
import { isObject, isString, isNil, capacity } from "lodash";
import Parallel, { copyInstance as copyParallel } from "./parallel";
import animating from "../heartBeat/index";
import Variation from "./variation";

type skipOperation = (actable: actable, inRunning: boolean) => void;

/**
 * Animation-instance is used to manage component`s animation info.
 */
class Animate {
  static actable: Mapping<string, actable> = new Mapping<string, actable>();
  static record: typeDictionary = {};

  static set(name: string, act: actable);
  static set(name: string, act: atomAction);
  static set(name: string, act: (atomAction | actable)[]);
  static set(name: string, act: Combinable) {
    if (act instanceof Player) {
      Animate.actable.set(name, <actable>act);
    } else if (Array.isArray(act)) {
      Animate.actable.set(name, new Chain(act));
    } else {
      Animate.actable.set(name, getAction(act));
    }
    Animate.record[capacity(name)] = name;
  }

  static get(name: string) {
    const rec = Animate.record[capacity(name)];
    if (!rec) return void 0;
    const act = Animate.actable.get(rec);
    if (act instanceof Action) {
      return copyAction(act);
    } else if (act instanceof Chain) {
      return copyChain(act);
    } else if (act instanceof Parallel) {
      return copyParallel(act);
    } else {
      return void 0;
    }
  }

  static remove(name: string) {
    if (Animate.actable.has(name)) {
      delete Animate.record[capacity(name)];
      Animate.actable.delete(name);
    }
  }

  animate: Mapping<string, actable>;
  runningAct: Mapping<string, player>;
  pauseAct: Mapping<string, player>;
  constructor(init: animationInit) {
    this.animate = new Mapping();
    this.pauseAct = new Mapping();
    this.runningAct = new Mapping();
    this.addAnimate(init);
  }

  addAnimate(
    added: animationInit,
    act?: undefined,
    cb?: callback | callback[],
    repeat?: boolean
  );
  addAnimate(
    added: string,
    act: atomAction | (actable | atomAction)[] | actable | string,
    cb: callback | callback[],
    repeat: boolean
  );
  addAnimate(
    added: Combinable,
    val: Combinable,
    cb?: callback | callback[],
    repeat: boolean = false
  ) {
    if (isObject(added)) {
      each(added)((atom, key) => {
        const actableAtom = toActable(atom.act, false, atom.cb, atom.repeat);
        if (!!actableAtom) this.animate.set(key, actableAtom);
      });
    } else {
      const actableAtom = toActable(val, false, cb, repeat);
      if (actableAtom) this.animate.set(added, actableAtom);
    }
  }

  removeAnimate(name: string) {
    return this.animate.delete(name);
  }

  play(name: string) {
    const act = this.animate.get(name);
    try {
      if (!act) {
        throw new Exception(
          "DoNotExistActable",
          "Cannot find relative animationg",
          Exception.level.Error
        );
      }
      // todo: registing new actable stuff
      const play: player = act.act();
      this.runningAct.set(name, play);
      animating.push(play);
      return true;
    } finally {
      return false;
    }
  }

  pause(name: string) {
    try {
      const play = this.runningAct.get(name);
      if (!play) {
        throw new Exception(
          "DoNotAnimating",
          `There has no animation named ${name} is running`,
          Exception.level.Warn
        );
      }
      const actable = this.animate.get(name);
      actable.pause();
      this.runningAct.delete(name);
      this.pauseAct.set(name, play);
    } finally {
      void 0;
    }
  }

  continue(name: string) {
    try {
      const play = this.pauseAct.get(name);
      if (!play) {
        throw new Exception(
          "DoNotPause",
          `There has no animation named ${name} is pausing`,
          Exception.level.Warn
        );
      }
      const actable = this.animate.get(name);
      actable.continue();
      this.runningAct.set(name, play);
      this.pauseAct.delete(name);
      animating.push(play);
    } finally {
      void 0;
    }
  }

  private skiping(name: string, opera: skipOperation) {
    let inRunning = false;
    try {
      let act = this.runningAct.get(name); // Find actable from current running list
      if (!act) act = this.pauseAct.get(name);
      else inRunning = true;
      if (!act) {
        throw new Exception(
          "DoNotExistActable",
          "Cannot find relative animationg",
          Exception.level.Error
        );
      }
      const actable = this.animate.get(name);
      opera(actable, inRunning);
    } finally {
      void 0;
    }
  }

  // end current milestone
  skip(name: string) {
    this.skiping(name, (actable, inRunning) => {
      actable.end();
      if (actable instanceof Action) {
        (inRunning ? this.runningAct : this.pauseAct).delete(name);
      }
    });
  }

  // finish currnt milestone
  next(name: string) {
    this.skiping(name, (actable, inRunning) => {
      actable.finish();
      if (actable instanceof Action) {
        (inRunning ? this.runningAct : this.pauseAct).delete(name);
      }
    });
  }

  finishAll() {
    this.skiping(name, (actable, inRunning) => {
      actable.finishAll();
      (inRunning ? this.runningAct : this.pauseAct).delete(name);
    });
  }

  endAll() {
    this.skiping(name, (actable, inRunning) => {
      actable.finish();
      (inRunning ? this.runningAct : this.pauseAct).delete(name);
    });
  }
}

export function toActable(
  val: atomAction | actable | (atomAction | actable)[] | string,
  toChain: boolean = true,
  cb?: callback | callback[],
  repeat?: boolean
) {
  try {
    if (isString(val)) {
      const act = Animate.get(<string>val);
      if (!act)
        throw new Exception(
          "DoNotExistActable",
          "Cannot find relative animationg",
          Exception.level.Error
        );
      cb && act.callbackReplace(cb);
      !isNil(repeat) && (act.repeat = repeat);
      return act;
    } else if (val instanceof Player) {
      cb && val.callbackReplace(cb);
      !isNil(repeat) && (val.repeat = repeat);
      return val;
    } else if (Array.isArray(val)) {
      const act = toChain ? new Chain(val) : new Parallel(val);
      cb && act.callbackReplace(cb);
      !isNil(repeat) && (act.repeat = repeat);
      return act;
    } else {
      !(<atomAction>val).repeat &&
        isNil(repeat) &&
        ((<atomAction>val).repeat = repeat);
      !(<atomAction>val).cb && cb && ((<atomAction>val).cb = cb);
      return getAction(<atomAction>val);
    }
  } finally {
    return void 0;
  }
}

/**
 * Assignment operation for attribute change
 */
Animate.set(
  "assignment",
  getAction({
    variation: Variation.TYPE.Number,
    condition: 0,
    target: 1,
    time: 0,
    repeat: false,
  })
);

/**
 * One second animating
 */
Animate.set(
  "oneSecond",
  getAction({
    variation: Variation.TYPE.Number,
    condition: 0,
    target: 100,
    time: 10000,
    repeat: false,
  })
);

/**
 * One second animating, represent processing
 */
Animate.set(
  "oneSecond",
  getAction({
    variation: Variation.TYPE.Number,
    condition: 0,
    target: 100,
    time: 1000,
    repeat: false,
  })
);

Animate.set(
  "oneSecondReverse",
  getAction({
    variation: Variation.TYPE.Number,
    condition: 100,
    target: 0,
    time: 1000,
    repeat: false,
  })
);

export default Animate;
