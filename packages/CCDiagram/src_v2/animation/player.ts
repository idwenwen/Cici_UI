import { isNil } from "lodash";
import { each } from "@cc/tools";
import {
  timeStep,
  duration,
  callback,
  processFunction,
  player,
} from "./typeDeclare";

enum PlayerStatus {}

class Player {
  static FinishTimes: number = 10;
  willPause: boolean; // Current process will pause
  isPausing: boolean; // Process is pausing
  willContinue: boolean; // Process will continue
  willEnd: boolean; // End current process immediately
  willFinish: boolean; // Finish current process quickly
  isFinish: boolean;
  willEndAll: boolean;
  willFinishAll: boolean;

  readyTime: timeStep;
  startTime: timeStep;
  interruptTime: [timeStep, timeStep][];
  endTime: timeStep;

  times: number;
  repeat: boolean;
  constructor(repeat?: boolean) {
    this.repeat = !!repeat;
  }

  ready() {
    !this.times && (this.times = 1);
    this.willPause = false;
    this.isPausing = false;
    this.willContinue = false;
    this.willEnd = false;
    this.willFinish = false;
    this.isFinish = false;
    this.willEndAll = false;
    this.willFinishAll = false;

    this.readyTime = null;
    this.startTime = null;
    this.interruptTime = [];
    this.endTime = null;
  }

  setTimes(times: number) {
    if (times > 0) this.times = times;
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

  finishAll() {
    this.willFinishAll = true;
  }

  endAll() {
    this.willEndAll = true;
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

  pausing(cb?: callback) {
    if (this.willPause) {
      this.willPause = false;
      this.isPausing = true;
      cb && cb.call(this);
      return true;
    }
    return false;
  }

  continuing(cb?: callback) {
    if (this.willContinue) {
      this.willContinue = false;
      this.isPausing = false;
      cb && cb.call(this);
      return true;
    }
    return false;
  }

  finishing(cb?: callback) {
    if (this.willFinish) {
      this.willFinish = false;
      cb && cb.call(this);
      return true;
    }
    return false;
  }

  ending(cb?: callback) {
    if (this.willEnd) {
      this.willEnd = false;
      cb && cb.call(this, null);
      return true;
    }
    return false;
  }

  endingAll(cb?: callback) {
    if (this.willEndAll) {
      this.willEndAll = false;
      cb && cb.call(this, null);
      return true;
    }
    return false;
  }

  finishingAll(cb?: callback) {
    if (this.willFinishAll) {
      this.willFinishAll = false;
      cb && cb.call(this, null);
      return true;
    }
    return false;
  }

  play(process: processFunction, delay: duration, duration: duration): player {
    this.ready();
    let willRepeat = this.repeat;
    let originTime = -1;
    return (timeStep: timeStep) => {
      if (isNil(this.readyTime)) {
        this.readyTime = timeStep;
      }

      if (
        this.ending(() => {
          this.isFinish = true;
          willRepeat = false;
        })
      )
        return false;

      if (
        this.pausing(() => {
          this.interruptTime.push([timeStep, null]);
        })
      )
        return false;

      this.continuing(() => {
        this.interruptTime[this.interruptTime.length - 1][1] = timeStep;
      });

      if (this.isPausing) {
        return false;
      }

      let between = timeStep - this.readyTime - this.pauseTime();
      this.finishing(() => {
        originTime = this.times;
        this.setTimes(Player.FinishTimes);
      });
      if (this.startTime || between >= delay) {
        if (isNil(this.startTime)) {
          this.startTime = timeStep;
        }
        process(between, this.times);
        if (between >= duration) {
          if (originTime > 0) {
            this.setTimes(originTime);
            originTime = -1;
          }
          if (willRepeat) {
            this.ready();
            willRepeat = this.repeat;
            return true;
          } else {
            this.isFinish = true;
            return false;
          }
        } else {
          return true;
        }
      }
      return true;
    };
  }

  act(_cb?: callback | callback[]) {}
}

export default Player;
