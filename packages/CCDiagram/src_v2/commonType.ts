export type Combinable = any; // 混合类型

export type Key = number | string | symbol;
export type Duration = number; // 事件长度
export type Progress = number; // 进度条
export type Dictionary = {
  // 字典对照表
  [key: string]: string;
};

export type Callback = (...result: any[]) => any;
