import { toAction } from "./action";
import { player } from "./player";
import { Duration } from "../../commonType";
import { toArray, eq } from "lodash";
import { each, remove, UUID } from "@cc/tools";
import Player from "./player";
import { Actable, ChainOrParallelAble, Playable } from "./declare";
import { Combinable } from "../../commonType";

type ChainNode = {
  action: Playable;
  once: boolean;
};

// 动作链的唯一标识
const chainID = new UUID((index) => `Chian_${index}`);

/**
 * 多个动作串行组成的一个动作链内容。
 * 1. 多个动作分步进行。
 * 2. 可以对动作链进行操作，并影响当前的运行动作。
 * 3. 可以添加临时一次性的动作内容，帮助特异化当前链内容。
 */
class Chain extends Player {
  list: ChainNode[]; // 运行链内容。
  current: number;
  constructor(
    context: any,
    name: string = chainID.get().toString(),
    chain?: Actable | Playable | (Playable | Actable)[],
    times?: number,
    repeat?: boolean
  ) {
    super(context, name, repeat, times);
    this.list = [];
    // @ts-ignore
    this.add(chain);
  }

  // 上下文设置
  set context(newContent: any) {
    super.context = newContent;
    // 同步单个Action的上下文环境
    each(this.list)((play) => {
      play.context = this._context;
    });
  }

  // 添加Action内容。
  add(actions: Actable, fromIndex?: number, once?: boolean);
  add(actions: Playable, fromIndex?: number, once?: boolean);
  add(actions: (Playable | Actable)[], fromIndex?: number, once?: boolean);
  add(actions: Combinable, fromIndex?: number, once: boolean = false) {
    // 判定当前的加入的位置。
    let start = fromIndex
      ? fromIndex < 0
        ? 0
        : fromIndex > this.list.length
        ? this.list.length
        : fromIndex
      : this.list.length;

    // 添加新的动作内容
    if (Array.isArray(actions)) {
      each(actions)((action, index) => {
        this.add(action, start + index);
      });
    } else {
      actions.context = this.context;
      this.list.splice(start, 0, {
        action: actions instanceof Player ? actions : toAction(actions), // 设置好上下文环境并转换称为Playable类型
        once: once,
      });
    }
  }

  // 依据动作名称删除当前的动作内容
  remove(name: string | string[]) {
    name = toArray(name); // 没有指定名称的方法，可能将会不方便删除。
    remove(this.list, (item: ChainNode) =>
      (<string[]>name).find((id) => eq(id, item.action.name))
    );
  }

  // 帧内容播放
  act(...meta: any[]): player {
    this.current = 0;
    let player = null;
    return super.loading(
      (current: Duration) => {
        if (!player) player = this.list[this.current].action.act(...meta);
        const result = player(current);
        if (!result) {
          // 如果当前的帧动作为单次动作，则运行完成之后直接删除，否则当期action游标移动一位
          this.list[this.current].once
            ? this.list.splice(this.current, 1)
            : (this.current += 1);
        }
        // 如果当前游标移动到末尾，则表示当前的内容结束。
        if (this.current >= this.list.length) return false;
        else return true;
      },
      () => {
        this.current = 0;
        player = null;
      }
    );
  }
}

export default Chain;

// 设置转化为对象实例
export function toChain(setting: ChainOrParallelAble) {
  return new Chain(
    setting.context,
    setting.name,
    setting.list,
    setting.times,
    setting.repeat
  );
}
