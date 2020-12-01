import { UUID } from "@cc/tools";
import { Duration } from "../../commonType";
import beat from "../heartbeat";

export type player = (timeStep: Duration) => void;

export type playerOperation = (current: Duration) => boolean;

const randomName = new UUID((index) => `Player_${index}`);

class Player {
  static MaxTimes: 20;
  static MinTimes: 0.05;

  name: string; // 当前动画的唯一标识
  startTime: Duration; // 开始时间
  endTime: Duration; // 结束时间

  runTime: Duration; // 已运行时长
  lastStep: Duration; // 上一次运行的时间标记

  repeat: boolean; // 是否循环播放
  times: number; // 当前播放运行时间。

  started: boolean; // 已经开始了与否
  isPausing: boolean; // 正在暂停状态中与否
  isPlaying: boolean; // 正在运行之中
  finished: boolean; // 是否已经完成

  _context: any; // 调用的时候的上下文环境

  constructor(
    context: any = null,
    name?: string,
    repeat: boolean = false,
    times: number = 1
  ) {
    this._context = context;
    this.name = name || randomName.get().toString();
    this.repeat = repeat;
    this.times = times;
    this.ready();
  }

  set context(newContext: any) {
    this._context = newContext;
  }

  get context() {
    return this._context;
  }

  ready() {
    this.startTime = null;
    this.endTime = null;
    this.runTime = 0;
    this.lastStep = null;

    this.started = false;
    this.isPausing = false;
    this.isPlaying = false;
    this.finished = false;
  }

  pause() {
    this.isPausing = true;
    // 清楚上一次的时间内容
    this.lastStep = null;
    // 从当前的运行器之中查找并筛入暂停列表之中。
    return beat.pause(this.name);
  }

  continue() {
    this.isPlaying = true;
    // 从暂停列表之中查找到
    return beat.continue(this.name);
  }

  finish() {
    this.times = Player.MaxTimes;
  }

  end() {
    beat.remove(this.name);
  }

  multiple(times: number) {
    this.times =
      times > Player.MaxTimes
        ? Player.MaxTimes
        : times < Player.MinTimes
        ? Player.MinTimes
        : times;
  }

  play(operation: playerOperation, restart?: Function): player {
    this.ready();
    return (timeStep: Duration) => {
      if (!this.startTime) this.startTime = timeStep;
      if (!this.lastStep) this.lastStep = timeStep;
      this.runTime += timeStep - this.lastStep; // 增加运行时长
      let next = operation(this.runTime * this.times); // 以杯数话当前运行时间来达到提速运行的目的
      if (!next && this.repeat) {
        // 重复当前内容
        this.ready();
        restart && restart();
        next = true;
      }
      return next;
    };
  }

  act(...meta: any[]): any {}

  start(...meta: any[]) {
    beat.play(this, ...meta);
  }
}

export default Player;
