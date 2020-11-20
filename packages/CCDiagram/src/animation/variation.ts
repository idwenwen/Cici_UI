import { Exception, Mapping, each, toRGBA } from "@cc/tools";
import { isFunction, multiply, add, subscribe, capacity } from "lodash";
import { Combinable, milestone, typeDictionary } from "./typeDeclare";

/**
 * Variation function represent change of process
 * 1. Preset variation function.
 * 2. Get result according to process, condition and predict target
 */
class Variation {
  static Change: Mapping<string, milestone> = new Mapping<string, milestone>();
  static TYPE: typeDictionary = {};

  static set(name: string[], operation: milestone[]);
  static set(name: string, operation: milestone);
  static set(name: Combinable, operation: Combinable) {
    Variation.Change.set(name, operation);
    if (Array.isArray(name)) {
      each(name)((val) => {
        Variation.TYPE[capacity(val)] = val;
      });
    } else {
      Variation.TYPE[capacity(name)] = name;
    }
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
      return Variation.Change.get(Variation.TYPE.Default);
    }
  }

  changing: milestone;
  constructor(change: string | milestone) {
    this.changing = <milestone>(
      (isFunction(change)
        ? Variation.get(<string>change || Variation.TYPE.Number)
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
    return this.changing(progress, condition, target);
  }
}

// Preset variation function including number-change and color change
Variation.set(
  ["default", "Number", "Color"],
  [
    (process: number, _condition: Combinable, _target: Combinable) => {
      return process;
    },
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
