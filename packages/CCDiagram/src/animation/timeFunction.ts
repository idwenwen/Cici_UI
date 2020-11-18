/**
 * Time Function represent changeof speed in action process.
 * 1. SpeedRate : Get speed rate at each timeStep, for calculate spped at that time
 * 2. Process: Get process of action timely.
 */

import { Mapping, Exception } from "@cc/tools";
import { capacity, divide } from "lodash";

export type timeStep = number;
export type duration = number;
export type timeRate = (current: timeStep, total: duration) => number;

/**
 * Default speed rate function
 */
enum SpeedRateType {
  Linear = "Linear",
  Ease = "Ease",
  EaseIn = "EaseIn",
  EaseOut = "EaseOut",
  EaseInOut = "EaseInOut",
}

/**
 * Content of time varying function,
 * 1. Preset speed-rate function
 * 2. Rate-change type
 * 3. Calculate process according to total-time and current timestep
 */
class TimeFunction {
  static SpeedRate: Mapping<string, timeRate> = new Mapping<string, timeRate>();
  static TYPE = SpeedRateType;

  /**
   * Setting new speed-rate function
   * @param type {string} unique mark for speed-rate function
   * @param func {function} Speed-rate function
   */
  static set(type: string, func: timeRate) {
    TimeFunction.SpeedRate.set(type, func);
    TimeFunction.TYPE[capacity(type)] = type;
  }

  /**
   * Get rate-function according to identification.
   * @param type {string} speed-rate function identification
   */
  static get(type: SpeedRateType): timeRate {
    const result = TimeFunction.SpeedRate.get(type);
    if (!result)
      // There has no result
      throw new Exception(
        "MapHasNoSuchInfo",
        `Can not find value implying to ${type} from TimeFunction.SpeedRate`,
        Exception.level.Error,
        false
      );
    else return result;
  }

  speedRate: timeRate;
  constructor(type?: SpeedRateType) {
    // Get rate-function according to type ,or user can set their own rate-function which will not cache
    this.speedRate = TimeFunction.get(type || SpeedRateType.Linear);
  }

  /**
   * Get progress according to time node
   * @param current {number} time step
   * @param total {number} duration
   */
  progress(current: timeStep, total: duration) {
    const basicSpeed = divide(1, total);
    const speedRate = this.speedRate(current, total);
    return basicSpeed * speedRate;
  }
}

// Preset SpeedRate operation
TimeFunction.SpeedRate.set(
  [
    SpeedRateType.Linear,
    SpeedRateType.Ease,
    SpeedRateType.EaseIn,
    SpeedRateType.EaseInOut,
    SpeedRateType.EaseOut,
  ],
  [
    (_current: timeStep, _total: duration) => 1,
    (_current: timeStep, _total: duration) => divide(_current, _total) + 0.5,
    (_current: timeStep, _total: duration) => divide(_current, _total) + 0.5,
    (_current: timeStep, _total: duration) => {
      const rate = divide(_current, divide(_total, 2));
      return rate <= 1 ? 0.5 + rate : 2.5 - rate;
    },
    (_current: timeStep, _total: duration) => 1.5 - divide(_current, _total),
  ]
);

export default TimeFunction;
