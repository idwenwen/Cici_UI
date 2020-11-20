/**
 * The current module is responsible for animation operation management
 */

import { Combinable, player, timeStep } from "./typeDeclare";
import { toArray } from "lodash";
import { each, remove } from "@cc/tools";

let runningAnimation: boolean = false;

class Animating {
  playing: player[];
  constructor() {
    this.playing = [];
  }

  push(player: player[]);
  push(player: player);
  push(player: Combinable) {
    this.playing.push(...toArray(player));
    this.play();
  }

  private running() {
    requestAnimationFrame((time: timeStep) => {
      const willDelete = [];
      each(this.playing)((atom, index) => {
        if (!atom(time)) {
          willDelete.push(index);
        }
      });
      if (willDelete.length > 0) {
        remove(
          this.playing,
          (_val, index) => {
            return willDelete.find((item) => index === item);
          },
          true
        );
      }
      if (this.playing.length > 0) {
        this.running();
      } else {
        runningAnimation = false;
      }
    });
  }

  play() {
    if (!runningAnimation) {
      runningAnimation = true;
      this.running();
    }
  }
}

const animating = new Animating();

export default animating;
