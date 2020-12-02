import { toAction } from "./action";
import { player } from "./player";
import { Duration } from "../../commonType";
import { toArray, eq } from "lodash";
import { each, remove } from "@cc/tools";
import Player from "./player";
import { CanBeActable, playable } from "./declare";

/**
 * 以逐个执行的形式运行当前action
 */
class Chain extends Player {
  name: string;
  list: playable[];
  current: number;
  constructor(
    context: any,
    name: string,
    list: CanBeActable | playable | (playable | CanBeActable)[],
    times?: number,
    repeat?: boolean
  ) {
    super(context, name, repeat, times);
    this.name = name;
    this.list = [];
    this.add(list);
  }

  set context(newContent: any) {
    super.context = newContent;
    each(this.list)((play) => {
      play.context = this._context;
    });
  }

  add(newList: CanBeActable | playable | (playable | CanBeActable)[]) {
    newList = toArray(newList);
    each(newList)((val) => {
      val.context = this.context;
      if (val instanceof Player) {
        this.list.push(val);
      } else {
        this.list.push(toAction(val));
      }
    });
  }

  remove(name: string | string[]) {
    name = toArray(name); // 没有指定名称的方法，可能将会不方便删除。
    remove(this.list, (item) =>
      (<string[]>name).find((id) => eq(id, item.name))
    );
  }

  act(...meta: any[]): player {
    this.current = 0;
    let player = null;
    return super.play(
      (current: Duration) => {
        if (!player) player = this.list[this.current].act(...meta);
        const result = player(current);
        if (!result) this.current += 1;
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

export function toChain() {}
