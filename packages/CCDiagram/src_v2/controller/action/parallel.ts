import { toAction } from "./action";
import { player } from "./player";
import { Duration } from "../../commonType";
import { toArray, eq } from "lodash";
import { each, remove } from "@cc/tools";
import Player from "./player";
import { CanBeActable, playable } from "./declare";

class Parallel extends Player {
  list: playable[];
  constructor(
    context: any,
    name: string,
    list: CanBeActable | playable | (playable | CanBeActable)[],
    times?: number,
    repeat?: boolean
  ) {
    super(context, name, repeat, times);
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

  act(...meta: any): player {
    let player = null;
    return super.play(
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
        player = [];
      }
    );
  }
}

export default Parallel;
