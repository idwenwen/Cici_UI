import { each, Exception, Mapping } from "@cc/tools";
import { getAction } from "./action";
import Chain from "./chain";
import Player from "./player";
import {
  actable,
  animationInit,
  atomAction,
  callback,
  Combinable,
  player,
} from "./typeDeclare";
import { isObject, isString, isNil } from "lodash";
import Parallel from "./parallel";
import animating from "./animate";

/**
 * Animation-instance is used to manage component`s animation info.
 */
class Animate {
  static actable: Mapping<string, actable> = new Mapping<string, actable>();

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
  }

  static get(name: string) {
    return Animate.actable.get(name);
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
    } finally {
      void 0;
    }
  }

  // end current milestone
  skip() {}

  // finish currnt milestone
  next() {}

  finishAll() {}
  endAll() {}
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
