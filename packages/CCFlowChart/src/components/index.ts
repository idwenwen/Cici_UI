import Port from "./port";

// 组件状态
export enum ComponentsStatus {
  unrun = "unrun|waiting",
  running = "running",
  fail = "failed|error|canceled",
  success = "success|complete",
}

class Components {
  name: string; // 当前组件的名称
  type: string; // 组件类型
  status: ComponentsStatus;
  disable: boolean; //当前组件是否运行
  inputPort: Port[]; // 当前组件入口。
  outputPort: Port[]; // 当前组件出口。
}

export default Components;
