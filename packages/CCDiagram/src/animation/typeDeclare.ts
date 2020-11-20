import Action from "./action";
import Chain from "./chain";
import Parallel from "./parallel";

export type Combinable = any;

export type timeStep = number; // time step for player
export type duration = number;
export type actable = Chain | Action | Parallel;

export type rateCurve = (current: timeStep, total: duration) => number;
export type milestone = (progress: number, condition: any, target: any) => any;
export type callback = (result?: Combinable) => any;
export type player = (timeStep: timeStep) => boolean;
export type findIndexCompare = (val: any) => boolean;
export type processFunction = (runningDuraion: duration, times: number) => any;

export type typeDictionary = {
  [str: string]: string;
};
export type animationInit = {
  [str: string]: {
    act: atomAction | (actable | atomAction)[] | actable | string;
    repeat?: boolean;
    cb?: callback | callback[];
  };
};
export type atomAction = {
  variation?: string | milestone;
  time: duration;
  cb?: callback | callback[];
  condition?: Combinable;
  target?: Combinable;
  timeFunction?: string | rateCurve;
  times?: number;
  repeat?: boolean;
};
