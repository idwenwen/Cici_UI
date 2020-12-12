import Player from "./player";
import { Combinable, Duration } from "../../commonType";
import Progress, { RateCurve } from "../progress";
import { each, Mapping, toRGBA, UUID } from "@cc/tools";
import { Actable, Variation } from "./declare";

const preset_link = ["number", "color"];

/**
 * 当前内容表示的是单个的动作变化内容。
 */
class Action extends Player {
  static VariationFunction: Mapping<string, Variation> = new Mapping();

  static set(name: string, operation: Variation);
  static set(name: string[], operation: Variation[]);
  static set(name: Combinable, operation: Combinable) {
    return Action.VariationFunction.set(name, operation);
  }

  static remove(name: string);
  static remove(name: string[]);
  static remove(name: Combinable) {
    return Action.VariationFunction.delete(name);
  }

  static get(name: string);
  static get(name: string[]);
  static get(name: Combinable) {
    return Action.VariationFunction.get(name);
  }

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
        this.context,
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

Action.set(preset_link, [
  (progress: number, condition: number, target: number) => {
    return condition + (target - condition) * progress;
  },
  (progress: number, condition: string, target: string) => {
    const origin = toRGBA(condition)
      .replace(/[(|)|rgba]/g, "")
      .split(",");
    const result = toRGBA(target)
      .replace(/[(|)|rgba]/g, "")
      .split(",");
    const final = each(origin)((val, index) => {
      const bet = parseInt(result[index]) - parseInt(val);
      return parseInt(val) + bet * progress;
    });
    return `rgba(${final.join(",")})`;
  },
]);
