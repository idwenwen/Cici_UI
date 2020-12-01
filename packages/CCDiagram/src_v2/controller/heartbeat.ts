import { each, Exception, Mapping } from "@cc/tools";
import { playable } from "./action/declare";
import { player } from "./action/player";

class HeartBeat {
  runningActions: Mapping<string, player>; // 正在运行的Action
  pausingActions: Mapping<string, player>; // 暂停运行Action

  running: boolean;

  constructor() {
    this.running = false;
    this.runningActions = new Mapping<string, player>();
    this.pausingActions = new Mapping<string, player>();
  }

  play(action: playable, ...meta: any[]) {
    const player = action.act(...meta);
    let name = action.name;
    this.runningActions.set(name, player);
  }

  pause(name: string) {
    try {
      const res = this.runningActions.get(name);
      if (res) {
        this.runningActions.delete(name);
        this.pausingActions.set(name, res);
        return true;
      } else {
        throw new Exception(
          "DonotExist",
          `Do not have value name matched with ${name}`,
          Exception.level.Info,
          false
        );
      }
    } finally {
      return false;
    }
  }

  continue(name: string) {
    try {
      const res = this.pausingActions.get(name);
      if (res) {
        this.pausingActions.delete(name);
        this.runningActions.set(name, res);
        this.trigger(); // 新加running内容，判定当前心跳是否启动。
        return true;
      } else {
        throw new Exception(
          "DonotExist",
          `Do not have value name matched with ${name}`,
          Exception.level.Info,
          false
        );
      }
    } finally {
      return false;
    }
  }

  remove(name: string) {
    this.runningActions.delete(name);
    this.pausingActions.delete(name);
  }

  trigger() {
    const step = () => {
      requestAnimationFrame((timeStep) => {
        const ending = [];
        each(this.runningActions)((item, key) => {
          if (item(timeStep)) ending.push(key); // 运行当前语句内容，并进行内容判定。
        });
        // 删除已经结束的动作
        each(ending)((name) => {
          this.runningActions.delete(name);
        });
        if (this.runningActions.size > 0) {
          step();
        }
      });
    };
    if (!this.running) {
      this.running = true;
      step();
    }
  }
}

const beat = new HeartBeat();

export default beat;
