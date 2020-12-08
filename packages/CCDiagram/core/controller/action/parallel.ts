import { toAction } from "./action";
import { player } from "./player";
import { Duration } from "../../commonType";
import { toArray, eq } from "lodash";
import { each, remove } from "@cc/tools";
import Player from "./player";
import { Actable, ChainOrParallelAble, Playable } from "./declare";
import { Combinable } from "../../commonType";

type ParallelNode = {
  action: Playable;
  once: boolean;
};

class Parallel extends Player {
  list: ParallelNode[];
  constructor(
    context: any,
    name: string,

    parallel: Actable | Playable | (Playable | Actable)[],

    times?: number,
    repeat?: boolean
  ) {
    super(context, name, repeat, times);
    this.list = [];
    // @ts-ignore
    this.add(parallel);
  }

  set context(newContent: any) {
    super.context = newContent;
    // 所有子动作的内容也将会设置上下文。
    each(this.list)((play) => {
      play.context = this._context;
    });
  }

  // 添加并行动作内容。
  add(para: Actable, once?: boolean);
  add(para: Playable, once?: boolean);
  add(para: (Playable | Actable)[], once?: boolean);
  add(para: Combinable, once: boolean = false) {
    if (Array.isArray(para)) {
      each(para)((action) => {
        this.add(action, once);
      });
    } else {
      para.context = this.context;
      this.list.push({
        action: para instanceof Player ? para : toAction(para),
        once,
      });
    }
  }

  remove(name: string | string[]) {
    name = toArray(name); // 没有指定名称的方法，可能将会不方便删除。
    remove(this.list, (item: ParallelNode) =>
      (<string[]>name).find((id) => eq(id, item.action.name))
    );
  }

  // 运行当前帧动作。
  act(...meta: any): player {
    let player = null;
    return super.loading(
      (current: Duration) => {
        if (!player) {
          player = [];
          each(this.list)((act) => {
            player.push(act.act(...meta));
          });
        }
        const result = each(player)((play) => {
          return play(current);
        });
        remove(player, (_val, index) => !result[index]);
        return player.length > 0;
      },
      () => {
        player = null;
      }
    );
  }
}

export default Parallel;
// 配置转换称为实例的方法。
export function toParallel(setting: ChainOrParallelAble) {
  return new Parallel(
    setting.context,
    setting.name,
    setting.list,
    setting.times,
    setting.repeat
  );
}
