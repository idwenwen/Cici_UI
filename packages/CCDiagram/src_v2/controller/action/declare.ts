import Player from "./player";
import { RateCurve } from "../progress";
import Action from "./action";
import Chain from "./chain";
import Parallel from "./parallel";

export type Variation = (progress: number, ...meta: any[]) => any;

export type CanBeActable = {
  name?: string;
  variation: Variation;
  time: number;
  progress?: string | RateCurve;
  times?: number;
  repeat?: boolean;
  context?: any;
};

export type playable = Action | Chain | Parallel | Player;
