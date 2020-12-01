/**
 * Time Function represent changeof speed in action process.
 * 1. SpeedRate : Get speed rate at each duration, for calculate spped at that time
 * 2. Process: Get process of action timely.
 */

import { Mapping, Exception, trapezoid } from "@cc/tools";
import { divide, isFunction, multiply } from "lodash";
import { Duration, Combinable } from "../commonType";

const preset_way = ["Linear", "Ease", "EaseIn", "EaseInOut", "EaseOut"];

export type RateCurve = (current: Duration, total: Duration) => number;
/**
 * Content of time varying function,
 * 1. Preset speed-rate function
 * 2. Rate-change type
 * 3. Calculate process according to total-time and current duration
 */
class Progress {
  static RATE: Mapping<string, RateCurve> = new Mapping<string, RateCurve>();

  /**
   * Setting new speed-rate function
   * @param type {string} unique mark for speed-rate function
   * @param func {function} Speed-rate function
   */
  static set(type: string[], func: RateCurve[]);
  static set(type: string, func: RateCurve);
  static set(type: Combinable, func: Combinable) {
    Progress.RATE.set(type, func);
  }

  /**
   * Get rate-function according to identification.
   * @param type {string} speed-rate function identification
   */
  static get(type: string): RateCurve {
    const result = Progress.RATE.get(type);
    try {
      if (!result)
        // There has no result
        throw new Exception(
          "MapHasNoSuchInfo",
          `Can not find value implying to ${type} from Progress.SpeedRate`,
          Exception.level.Error,
          false
        );
      else return result;
    } finally {
      return Progress.RATE.get(preset_way[0]);
    }
  }

  curve: RateCurve;
  constructor(type?: string | RateCurve) {
    // Get rate-function according to type ,or user can set their own rate-function which will not cache
    this.curve = <RateCurve>(
      (isFunction(type) ? Progress.get(<string>type || preset_way[0]) : type)
    );
  }

  /**
   * Get progress according to time node
   * @param current {number} time step
   * @param total {number} duration
   */
  progress(current: Duration, total: Duration) {
    return this.curve(current, total);
  }
}

// Preset SpeedRate operation
Progress.set(preset_way, [
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

export default Progress;
