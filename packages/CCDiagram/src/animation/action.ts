import Player from "./player";
import TimeFunction from "./timeFunction";
import Variation from "./variation";
import { toArray, divide } from "lodash";
import animating from "../heartBeat/index";

import {
  milestone,
  Combinable,
  duration,
  callback,
  rateCurve,
  atomAction,
  player,
} from "./typeDeclare";
import { each, Exception, UUID } from "@cc/tools";

const ActionParameter: atomAction = {
  target: null,
  variation: Variation.TYPE.Number,
  time: 1000,
  timeFunction: TimeFunction.TYPE.Linear,
  times: 1,
  repeat: false,
  cb: (res) => res,
};

const ActionId = new UUID((origin) => {
  return `action_${origin}`;
});

/**
 * Action for diagram
 * 1. Cache atom action for parameter of component.
 * 2. Playing controller
 */
class Action extends Player {
  static BasicSetting = ActionParameter;
  static variation = Variation;
  static timeFunction = TimeFunction;

  uuid: string;
  variation: Variation;
  timeFunction: TimeFunction;
  time: duration;

  condition: Combinable;
  target: Combinable;

  cb: callback[];
  constructor(
    variation: string | milestone,
    time: duration,
    cb?: callback | callback[],
    target?: Combinable,
    condition?: Combinable,
    timeFunction?: string | rateCurve,
    times?: number,
    repeat: boolean = false
  ) {
    super(repeat);
    this.uuid = ActionId.get().toString();
    this.variation = new Variation(variation);
    this.time = time;
    this.timeFunction = new TimeFunction(timeFunction);
    this.condition = condition;
    this.target = target;
    this.cb = cb ? toArray(cb) : [];
    this.setTimes(times || 1);
  }

  finishAll() {
    this.willFinish = true;
  }

  endAll() {
    this.willEnd = true;
  }

  act(callbackable: callback | callback[] = []): player {
    return super.play(
      (runningDuration: duration, times: number) => {
        const progress = this.timeFunction.progress(
          runningDuration,
          divide(this.time, times)
        );
        const result = this.variation.next(
          progress,
          this.condition,
          this.target
        );
        callbackable = toArray(callbackable);
        try {
          const allCb = [...this.cb, ...(<Array<callback>>callbackable)];
          if (allCb.length <= 0) {
            throw new Exception(
              "DoNotHaveCallback",
              `Do not have any callback when call action ${this.uuid}`,
              Exception.level.Warn
            );
          }
          each(allCb)((opera) => {
            return opera(result);
          });
        } finally {
          void 0;
        }
      },
      0,
      this.time
    );
  }

  callback(cb: callback | callback[]) {
    this.cb.push(toArray[cb]);
  }

  callbackReplace(cb: callback | callback[]) {
    this.cb = toArray(cb);
  }

  once(cb?: callback | callback[]) {
    animating.push(this.act(cb));
  }
}

export default Action;

export function getAction(setting: atomAction) {
  const finalSetting = Object.assign({}, Action.BasicSetting, setting);
  return new Action(
    finalSetting.variation,
    finalSetting.time,
    finalSetting.cb,
    finalSetting.target,
    finalSetting.condition,
    finalSetting.timeFunction,
    finalSetting.times,
    finalSetting.repeat
  );
}

export function copyInstance(act: Action) {
  return new Action(
    act.variation.changing,
    act.time,
    act.cb,
    act.target,
    act.condition,
    act.timeFunction.speedRate,
    act.times,
    act.repeat
  );
}
