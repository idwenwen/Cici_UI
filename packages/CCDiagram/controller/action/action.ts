import Player from "./player";
import { Duration } from "../../commonType";
import Progress, { RateCurve } from "../progress";
import { UUID } from "@cc/tools";
import { Actable, Variation } from "./declare";

/**
 * 当前内容表示的是单个的动作变化内容。
 */
class Action extends Player {
  progressing: Progress; // 当前action的运行进度计算方法。
  time: Duration; // 动作运行时长。
  variation: Variation; // 变换函数。

  constructor(
    context: any, // 上下文环境
    name: string, // 动作标识

    variation: Variation,
    time: Duration,
    progress?: string | RateCurve,

    times: number = 1, // 默认播放倍数为1
    repeat: boolean = false // 默认当前动作不重复
  ) {
    super(context, name, repeat, times);
    this.variation = variation;
    this.time = time;
    this.progressing = new Progress(progress);
  }

  act(...meta: any[]) {
    return this.loading((current: Duration) => {
      return !!this.variation.call(
        this._context,
        this.progressing.progress(current, this.time),
        ...meta
      );
    });
  }
}

export default Action;

// 单帧动作内容唯一标识。
const RandomIdForOneTimeAction = new UUID((index) => `once_${index}`);
// 创建单帧动作
export function once(context: any, operation: Function) {
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

// 一次性特定动作内容标识
const randomIdForAction = new UUID((index) => `Action_${index}`);
// 配置文件转换称为动作对象。
export function toAction(act: Actable) {
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
