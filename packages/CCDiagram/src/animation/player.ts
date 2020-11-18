import { isNil, toArray } from "lodash";
import { each } from "@cc/tools";
import { timeStep, duration } from "./timeFunction";

type proceeFunction = (runningDutaion: duration) => any;
type callback = (res: any) => any;

class Player {
  willPause: boolean; // Current process will pause
  pausing: boolean; // Process is pausing
  willContinue: boolean; // Process will continue
  willEnd: boolean; // End current process immediately
  willFinish: boolean; // Finish current process quickly

  readyTime: timeStep;
  startTime: timeStep;
  interruptTime: [timeStep, timeStep][];
  endTime: timeStep;

  cb: callback[];
  constructor(cb?: callback | callback[]) {
    this.cb = toArray(cb) || [];
  }

  ready() {
    this.willPause = false;
    this.pausing = false;
    this.willContinue = false;
    this.willEnd = false;
    this.willFinish = false;

    this.readyTime = null;
    this.startTime = null;
    this.interruptTime = [];
    this.endTime = null;
  }

  pause() {
    this.willPause = true;
  }

  continue() {
    this.willContinue = false;
  }

  end() {
    this.willEnd = true;
  }

  finish() {
    this.willFinish = true;
  }

  private pauseTime(): duration {
    let duration = 0;
    each(this.interruptTime)((val) => {
      if (isNil(this.startTime)) {
        duration += val[1] - val[0];
      } else {
        if (val[0] >= this.startTime) {
          duration += val[1] - val[0];
        } else if (val[1] > this.startTime && val[0] < this.startTime) {
          duration += val[1] - this.startTime;
        }
      }
    });
    return duration;
  }

  play(process: proceeFunction, delay: duration, duration: duration): Function {
    return (timeStep: timeStep) => {
      if (isNil(this.readyTime)) {
        this.readyTime = timeStep;
      }

      if (this.willEnd) {
        // End immediately
        this.willEnd = false;
        return false;
      }

      if (this.willPause) {
        // Process is pausing and record interrupt time
        this.willPause = false;
        this.pausing = true;
        this.interruptTime.push([timeStep, null]);
        return false;
      }

      if (this.willContinue) {
        // Continuing process
        this.willContinue = false;
        this.pausing = false;
        this.interruptTime[this.interruptTime.length - 1][1] = timeStep;
      }

      if (this.pausing) {
        return false;
      }

      let between = timeStep - this.readyTime - this.pauseTime();
      if (this.willFinish) {
        this.willFinish = false;
        between = duration;
      }
      if (this.startTime || between >= delay) {
        if (isNil(this.startTime)) {
          this.startTime = timeStep;
        }
        const result = process(between);
        each(this.cb)((opera: callback) => {
          return opera(result);
        });
        if (between >= duration) {
          return false;
        } else {
          return true;
        }
      }
      return true;
    };
  }
}

export default Player;
