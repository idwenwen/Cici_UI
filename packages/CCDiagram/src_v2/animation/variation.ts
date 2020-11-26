import { Exception, Mapping, each, toRGBA } from "@cc/tools";
import { isFunction, multiply, add, subscribe } from "lodash";
import { Combinable } from "../commonType";

type variating<T> = (progress: number, condition: T, target: T) => T;

const preset_way = ["Number", "Color"];

/**
 * Variation function represent change of process
 * 1. Preset variation function.
 * 2. Get result according to process, condition and predict target
 */
class Variation {
  static Change: Mapping<string, variating<any>> = new Mapping<
    string,
    variating<any>
  >();

  static set(name: string[], operation: variating<any>[]);
  static set(name: string, operation: variating<any>);
  static set(name: Combinable, operation: Combinable) {
    Variation.Change.set(name, operation);
  }

  static get(name: string) {
    const result = Variation.Change.get(name);
    try {
      if (!result)
        throw new Exception(
          "MapHasNoSuchInfo",
          `Can not find value named ${name} from Variation.Change`,
          Exception.level.Error,
          false
        );
      else return result;
    } finally {
      return Variation.Change.get(preset_way[0]);
    }
  }

  variating: variating<any>;
  constructor(change: string | variating<any>) {
    this.variating = <variating<any>>(
      (isFunction(change)
        ? Variation.get(<string>change || preset_way[0])
        : change)
    );
  }

  /**
   * Get operational milestone
   * @param progress {number} current progress
   * @param condition {any} starting condition
   * @param target {any} predict target
   */
  next(progress: number, condition: any, target: any): any {
    return this.variating(progress, condition, target);
  }
}

// Preset variation function including number-change and color change
Variation.set(preset_way, [
  (process: number, condition: number, target: number): number => {
    const between = target - condition;
    return condition + multiply(process, between);
  },

  (process: number, condition: string, target: string): string => {
    const rgbaRp = /(\(|\)|[a-zA-Z]))/g;
    let origin: string[] = (<string>toRGBA(condition))
      .replace(rgbaRp, "")
      .split(",");
    let tar: string[] = (<string>toRGBA(target)).replace(rgbaRp, "").split(",");
    const final = each(origin)((val, i) => {
      const bet = subscribe(Number(tar[i]), Number(val));
      return add(Number(val), multiply(bet, process));
    });
    return `rgba(${final.join(",")})`;
  },
]);

export default Variation;
