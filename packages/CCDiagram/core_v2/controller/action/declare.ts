import Player from "./player";
import { RateCurve } from "../progress";
import Action from "./action";
import Chain from "./chain";
import Parallel from "./parallel";

// 依据进度计算变化。
export type Variation = (progress: number, ...meta: any[]) => any;

type SettingForPlayer = {
  name?: string;
  times?: number;
  repeat?: boolean;
  context?: any;
};

// 转化称为Action的基础配置对象
export type Actable = {
  variation: Variation;
  time: number;
  progress?: string | RateCurve;
} & SettingForPlayer;

export type ChainOrParallelAble = {
  list?: Actable | Playable | (Playable | Actable)[];
} & SettingForPlayer;

// 可播放帧对象类型。
export type Playable = Action | Chain | Parallel | Player;
