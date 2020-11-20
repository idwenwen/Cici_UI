/**
 * Time Function represent changeof speed in action process.
 * 1. SpeedRate : Get speed rate at each timeStep, for calculate spped at that time
 * 2. Process: Get process of action timely.
 */

import { Mapping, Exception, each, trapezoid } from "@cc/tools";
import { capacity, divide, isFunction, multiply, add } from "lodash";
import {
  timeStep,
  duration,
  rateCurve,
  Combinable,
  typeDictionary,
} from "./typeDeclare";

/**
 * Content of time varying function,
 * 1. Preset speed-rate function
 * 2. Rate-change type
 * 3. Calculate process according to total-time and current timestep
 */
class TimeFunction {
  static SpeedRate: Mapping<string, rateCurve> = new Mapping<
    string,
    rateCurve
  >();
  static TYPE: typeDictionary = {};

  /**
   * Setting new speed-rate function
   * @param type {string} unique mark for speed-rate function
   * @param func {function} Speed-rate function
   */
  static set(type: string[], func: rateCurve[]);
  static set(type: string, func: rateCurve);
  static set(type: Combinable, func: Combinable) {
    TimeFunction.SpeedRate.set(type, func);
    if (Array.isArray(type)) {
      each(type)((val) => {
        TimeFunction.TYPE[capacity(val)] = val;
      });
    } else {
      TimeFunction.TYPE[capacity(type)] = type;
    }
  }

  /**
   * Get rate-function according to identification.
   * @param type {string} speed-rate function identification
   */
  static get(type: string): rateCurve {
    const result = TimeFunction.SpeedRate.get(type);
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
      return TimeFunction.SpeedRate.get(TimeFunction.TYPE.Linear);
    }
  }

  speedRate: rateCurve;
  constructor(type?: string | rateCurve) {
    // Get rate-function according to type ,or user can set their own rate-function which will not cache
    this.speedRate = <rateCurve>(
      (isFunction(type)
        ? TimeFunction.get(<string>type || TimeFunction.TYPE.Linear)
        : type)
    );
  }

  /**
   * Get progress according to time node
   * @param current {number} time step
   * @param total {number} duration
   */
  progress(current: timeStep, total: duration) {
    return this.speedRate(current, total);
  }
}

// Preset SpeedRate operation
TimeFunction.set(
  ["Linear", "Ease", "EaseIn", "EaseInOut", "EaseOut"],
  [
    (_current: timeStep, _total: duration) => {
      const basicSpeed = divide(1, _total);
      return multiply(_current, basicSpeed);
    },
    (_current: timeStep, _total: duration) => {
      const basicSpeed = divide(1, _total);
      const cur = divide(_current, _total) + 0.5;
      const begin = 0.5;
      return trapezoid(
        multiply(cur * basicSpeed),
        multiply(begin * basicSpeed),
        _current
      );
    },
    (_current: timeStep, _total: duration) => {
      const basicSpeed = divide(1, _total);
      const cur = divide(_current, _total) + 0.5;
      const begin = 0.5;
      return trapezoid(
        multiply(cur * basicSpeed),
        multiply(begin * basicSpeed),
        _current
      );
    },
    (_current: timeStep, _total: duration) => {
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
    (_current: timeStep, _total: duration) => {
      const basicSpeed = divide(1, _total);
      const cur = 1.5 - divide(_current, _total);
      const begin = 1.5;
      return trapezoid(
        multiply(cur * basicSpeed),
        multiply(begin * basicSpeed),
        _current
      );
    },
  ]
);

export default TimeFunction;
