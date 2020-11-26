/**
 * 进程对象，表示当前的动作运行的进度。
 * 1. 通过运行时长以及总时长来确定当进度。
 * 2. 多种计算进度的方式。
 */

import { Mapping, Exception, trapezoid } from "@cc/tools";
import { divide, isFunction, multiply } from "lodash";
import { Combinable, Duration, Progress } from "../commonType";
import config from "./config";

// 进度计算方法的类行
type progressing = (current: Duration, total: Duration) => Progress;

// 预设进度计算方法
const preset_way = ["Linear", "Ease", "EaseIn", "EaseInOut", "EaseOut"];

/**
 * 进度管理类
 * 1. 类方法提供全局的进度计算方案，用于预设操作函数。
 * 2. 实例依据用户设置的进度计算形式来确定当前的进度数值。
 */
class Processer {
  //
  static RATE: Mapping<string, progressing> = new Mapping<
    string,
    progressing
  >();

  /**
   * Setting new speed-rate function
   * @param type {string} unique mark for speed-rate function
   * @param func {function} Speed-rate function
   */
  static set(type: string[], func: progressing[]);
  static set(type: string, func: progressing);
  static set(type: Combinable, func: Combinable) {
    Processer.RATE.set(type, func);
  }

  /**
   * Get rate-function according to identification.
   * @param type {string} speed-rate function identification
   */
  static get(type: string): progressing {
    const result = Processer.RATE.get(type);
    try {
      if (!result)
        // There has no result
        throw new Exception(
          "MapHasNoSuchInfo",
          `Can not find value implying to ${type} from TimeFunction.SpeedRate`,
          Exception.level.Error,
          false
        );
      else return result;
    } finally {
      return Processer.RATE.get(preset_way[0]);
    }
  }

  progress: progressing;
  constructor(type?: string | progressing) {
    // Get rate-function according to type ,or user can set their own rate-function which will not cache
    this.progress = <progressing>(
      (isFunction(type) ? Processer.get(<string>type || preset_way[0]) : type)
    );
  }

  /**
   * Get progress according to time node
   * @param current {number} time step
   * @param total {number} Duration
   */
  progressing(current: Duration, total: Duration = config.duration): Progress {
    return this.progress(current, total);
  }
}

// Preseting ways which uses to calculate progress of variation function
Processer.set(preset_way, [
  (_current: Duration, _total: Duration) => {
    const basicSpeed = divide(1, _total);
    return multiply(_current, basicSpeed);
  },
  (_current: Duration, _total: Duration) => {
    const basicSpeed = divide(1, _total);
    const cur = divide(_current, _total) + 0.5;
    const begin = 0.5;
    return trapezoid(
      multiply(cur * basicSpeed),
      multiply(begin * basicSpeed),
      _current
    );
  },
  (_current: Duration, _total: Duration) => {
    const basicSpeed = divide(1, _total);
    const cur = divide(_current, _total) + 0.5;
    const begin = 0.5;
    return trapezoid(
      multiply(cur * basicSpeed),
      multiply(begin * basicSpeed),
      _current
    );
  },
  (_current: Duration, _total: Duration) => {
    const basicSpeed = divide(1, _total);
    const begin = 0.5;
    const midBegin = 1.5;
    let cur = divide(_current, divide(_total, 2));
    let progress = trapezoid(
      multiply((cur > 1 ? 1.5 : 0.5 + cur) * basicSpeed),
      multiply(begin * basicSpeed),
      _current
    );
    progress +=
      cur > 1
        ? trapezoid(
            multiply((2.5 - cur + cur) * basicSpeed),
            multiply(midBegin * basicSpeed),
            _current
          )
        : 0;
    return progress;
  },
  (_current: Duration, _total: Duration) => {
    const basicSpeed = divide(1, _total);
    const cur = 1.5 - divide(_current, _total);
    const begin = 1.5;
    return trapezoid(
      multiply(cur * basicSpeed),
      multiply(begin * basicSpeed),
      _current
    );
  },
]);

export default Processer;
