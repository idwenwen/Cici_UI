export type Combinable = any; // 混合类型

export type Key = number | string | symbol;
export type Duration = number; // 事件长度
export type Progress = number; // 进度条
export type Dictionary = {
  // 字典对照表
  [key: string]: string | number;
};

export type Callback = (...args: any[]) => any;

export type Point = [number, number]; // 点结构。
