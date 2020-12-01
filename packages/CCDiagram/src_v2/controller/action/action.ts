import Player from "./player";
import { Duration } from "../../commonType";
import Progress, { RateCurve } from "../progress";
import { UUID } from "@cc/tools";
import { CanBeActable, Variation } from "./declare";

/**
 * 当前内容表示的是单格的动作内容
 */
class Action extends Player {
  progressing: Progress; // 当前action的运行进度。
  time: Duration; // 动作运行时长
  variation: Variation; // 步骤函数。
  constructor(
    context: any,
    name: string,
    variation: Variation,
    time: Duration,
    progress?: string | RateCurve,
    times: number = 1,
    repeat: boolean = false
  ) {
    super(context, name, repeat, times);
    this.variation = variation;
    this.time = time;
    this.progressing = new Progress(progress);
  }

  act(...meta: any[]) {
    return this.play((current: Duration) => {
      return !!this.variation.call(
        this._context,
        this.progressing.progress(current, this.time),
        ...meta
      );
    });
  }
}

export default Action;

const RandomIdForOneTimeAction = new UUID((index) => `once_${index}`);
export function assignment(context: any, operation: Function) {
  new Action(
    context,
    RandomIdForOneTimeAction.get().toString(),
    (progress) => {
      if (progress >= 1) {
        operation();
      }
    },
    0
  ).act();
}

const randomIdForAction = new UUID((index) => `Action_${index}`);
export function toAction(act: CanBeActable) {
  return new Action(
    act.context,
    act.name || randomIdForAction.get().toString(),
    act.variation,
    act.time,
    act.progress,
    act.times,
    act.repeat
  );
}
