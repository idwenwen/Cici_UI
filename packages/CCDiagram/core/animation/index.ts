import { each, Exception, Mapping, remove } from "@cc/tools";
import { Combinable } from "../commonType";
import {
  Actable,
  ChainOrParallelAble,
  Playable,
} from "../controller/action/declare";
import { isObject, toArray } from "lodash";
import Player from "../controller/action/player";
import { toActable } from "../controller/action/index";

export type SingleAnimateSetting =
  | Actable
  | (ChainOrParallelAble & { toChain?: boolean })
  | Playable;

export type animateSetting = {
  [name: string]: SingleAnimateSetting | SingleAnimateSetting[];
};

type AnimateNode = {
  action: Playable;
  once: boolean;
};

export enum AnimationOperation {
  Dispatch = "dispatch",
  Pause = "pause",
  Continue = "continue",
  Finish = "finish",
  End = "end",
  Times = "times",
  Repeat = "repeat",
}

class Animate {
  context: any; // 动画的上下文环境。
  animations: Mapping<string, AnimateNode[]>; // 相关动画内容

  constructor(context: any, setting?: animateSetting) {
    this.context = context;
    this.animations = new Mapping<string, AnimateNode[]>();
    setting && this.add(setting);
  }

  add(name: string, func: SingleAnimateSetting, once?: boolean);
  add(name: string, func: SingleAnimateSetting[], once?: boolean);
  add(name: animateSetting, func?: boolean, once?: never);
  add(name: Combinable, func: Combinable = false, once: boolean = false) {
    if (isObject(name)) {
      each(name)((val, key) => {
        this.add(key, val, func);
      });
    } else {
      const list = this.animations.get(name) || [];
      func = toArray(func);
      each(func)((op) => {
        op.context = this.context;
        list.push({
          action: op instanceof Player ? <Playable>op : toActable(op),
          once,
        });
      });
      this.animations.set(name, list);
    }
  }

  // 删除animate实例管理的动画。
  remove(name: string | string[]) {
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
        let willRemove = [];
        each(actions)((player: AnimateNode, index) => {
          opera(player.action);
          player.once && willRemove.push(index);
        });
        if (willRemove.length > 0) {
          // 删除单次运行动画
          remove(actions, (_val, index) => willRemove.find((i) => i === index));
          this.animations.set(name, actions); // 更新当前的映射内容
        }
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

  // 动画倍数播放
  times(name: string, t: number = 1) {
    this.notify(name, (act) => {
      act.multiple(t);
    });
  }

  // 动画重复播放
  repeat(name: string, rep: boolean = false) {
    this.notify(name, (act) => {
      act.repeat = rep;
    });
  }

  // 动画暂停
  pause(name: string) {
    this.notify(name, (act) => {
      act.pause();
    });
  }

  // 动画继续
  continue(name: string) {
    this.notify(name, (act) => {
      act.continue();
    });
  }

  // 动画快速完成
  finish(name: string) {
    this.notify(name, (act) => {
      act.finish();
    });
  }

  // 动画马上结束
  end(name: string) {
    this.notify(name, (act) => {
      act.end();
    });
  }
}

export default Animate;
