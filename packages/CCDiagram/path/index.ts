import Figure from "../figure/index";
import circle from "./circle";
import curve from "./curve";
import rect from "./rect";
import text from "./text";
import icon from "./icon";
import { each } from "@cc/tools";

const pathList = [circle, curve, rect, text, icon];

((pathList) => {
  each(pathList)((val) => {
    Figure.Path.set(val.name, val.draw);
  });
})(pathList);
