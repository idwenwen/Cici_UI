import { Tree } from "@cc/tools";
import Diagram from "../index";
import DrawPath from "./drawPath/index";

class Figure extends Tree {
  drawPath: DrawPath; // 表示的是当前绘制路径内容。
  belongTo: Diagram; // 表示当前图形属于那一块图表。
}

export default Figure;
