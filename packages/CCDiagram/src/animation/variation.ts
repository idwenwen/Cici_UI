import { Exception, Mapping } from "@cc/tools";
import { isFunction, multiply, add, subscribe } from "lodash";
import { each } from "node_modules/@cc/tools/extension/array";
import { toRGBA } from "node_modules/@cc/tools/extension/color";

export type variationFunction = (
  process: number,
  condition: any,
  target: any
) => any;

/**
 * Variation function represent change of process
 * 1. Preset variation function.
 * 2. Get result according to process, condition and predict target
 */
class Variation {
  static Change: Mapping<string, variationFunction> = new Mapping<
    string,
    variationFunction
  >();

  static set(name: string, operation: variationFunction) {
    Variation.Change.set(name, operation);
  }

  static get(name: string) {
    const result = Variation.Change.get(name);
    if (!result)
      throw new Exception(
        "MapHasNoSuchInfo",
        `Can not find value named ${name} from Variation.Change`,
        Exception.level.Error,
        false
      );
    else return result;
  }

  changing: variationFunction;
  constructor(change: string | variationFunction) {
    this.changing = <variationFunction>(
      (isFunction(change) ? Variation.get(<string>change) : change)
    );
  }

  /**
   * Get operational milestones
   * @param process {number} current progress
   * @param condition {any} starting condition
   * @param target {any} predict target
   */
  next(process: number, condition: any, target: any) {
    return this.changing(process, condition, target);
  }
}

// Preset variation function including number-change and color change
Variation.Change.set(
  ["Number", "Color"],
  [
    (process: number, condition: number, target: number): number => {
      const between = target - condition;
      return condition + multiply(process, between);
    },

    (process: number, condition: string, target: string): string => {
      const rgbaRp = /(\(|\)|[a-zA-Z]))/g;
      let origin: string[] = (<string>toRGBA(condition))
        .replace(rgbaRp, "")
        .split(",");
      let tar: string[] = (<string>toRGBA(target))
        .replace(rgbaRp, "")
        .split(",");
      const final = each(origin)((val, i) => {
        const bet = subscribe(Number(tar[i]), Number(val));
        return add(Number(val), multiply(bet, process));
      });
      return `rgba(${final.join(",")})`;
    },
  ]
);

export default Variation;
