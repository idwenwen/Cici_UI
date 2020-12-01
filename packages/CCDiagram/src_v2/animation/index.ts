import { each, Exception, Mapping } from "@cc/tools";
import { Combinable } from "../commonType";
import { CanBeActable, playable } from "../controller/action/declare";
import { isObject, toArray } from "lodash";
import Player from "../controller/action/player";
import { toAction } from "../controller/action/action";

export type animateSetting = {
  [name: string]: CanBeActable | playable | (playable | CanBeActable)[];
};

class Animate {
  context: any;
  animations: Mapping<string, playable[]>;
  constructor(context: any, setting: animateSetting) {
    this.context = context;
    this.animations = new Mapping<string, playable[]>();
    this.add(setting);
  }

  add(name: string, func: CanBeActable);
  add(name: string, func: playable);
  add(name: string, func: Array<CanBeActable | playable>);
  add(name: animateSetting, func?: never);
  add(name: Combinable, func: Combinable) {
    if (isObject(name)) {
      each(name)((val, key) => {
        this.add(key, val);
      });
    } else {
      const list = this.animations.get(name) || [];
      func = toArray(func);
      each(func)((op) => {
        op.context = this.context;
        if (op instanceof Player) {
          list.push(<playable>op);
        } else {
          list.push(toAction(op));
        }
      });
      this.animations.set(name, list);
    }
  }

  removeAnimation(name: string | string[]) {
    name = toArray(name);
    each(<string[]>name)((type) => {
      this.animations.delete(type);
    });
  }

  private notify(name: string, opera: Function) {
    try {
      const actions = this.animations.get(name);
      if (!actions) {
        throw new Exception(
          "DonotExist",
          `There has no animation nameed ${name} can be dispatch`,
          Exception.level.Warn,
          false
        );
      } else {
        each(actions)((player: playable) => {
          opera(player);
        });
      }
      return true;
    } finally {
      return false;
    }
  }

  // 执行动画
  dispatch(name: string, ...meta: any[]) {
    this.notify(name, (player) => {
      player.start(...meta);
    });
  }

  times(name: string, t: number = 1) {
    this.notify(name, (act) => {
      act.multiple(t);
    });
  }

  repeat(name: string, rep: boolean = false) {
    this.notify(name, (act) => {
      act.repeat = rep;
    });
  }

  pause(name: string) {
    this.notify(name, (act) => {
      act.pause();
    });
  }

  continue(name: string) {
    this.notify(name, (act) => {
      act.continue();
    });
  }

  finish(name: string) {
    this.notify(name, (act) => {
      act.finish();
    });
  }

  end(name: string) {
    this.notify(name, (act) => {
      act.end();
    });
  }
}

export default Animate;
