import Player from "./player";
import TimeFunction from "./timeFunction";
import Variation from "./variation";

type duration = number;
type callback = (res: any) => any;
type variationFunction = (process: number, condition: any, target: any) => any;

/**
 * Action for diagram
 * 1. Cache atom action for parameter of component.
 * 2.
 */
class Action extends Player {
  static variation = Variation;
  static timeFunction = TimeFunction;

  variation: Variation;
  timeFunction: TimeFunction;
  time: duration;
  delay: duration;
  constructor(
    variation: string | variationFunction,
    time: duration,
    cb?: callback,
    delay?: duration,
    timeFunction = TimeFunction.TYPE.Linear
  ) {
    super(cb);
    this.variation = new Variation(variation);
    this.time = time;
    this.timeFunction = new TimeFunction(timeFunction);
    this.delay = delay;
  }
}
