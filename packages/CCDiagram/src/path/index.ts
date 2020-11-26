import { Exception, Mapping } from "@cc/tools";
import { diagram, diagramDrawing, diagramParameter } from "./typeDeclare";
import { isObject } from "lodash";
import { match } from "./filters/index";
import { drawing } from "./painting/canvas";

/**
 * Path manager, for preseting component drawing
 */
class Path {
  static Diagram: Mapping<string, diagram> = new Mapping();
  static Util: Function = drawing;

  drawing: diagramDrawing;
  parameter: diagramParameter;
  willFilter: boolean;
  _once: boolean;
  constructor(drawing: string | diagram, filter?: boolean) {
    const diagram = isObject(drawing)
      ? <diagram>drawing
      : <diagram>Path.Diagram.get(<string>drawing);
    this.drawing = diagram.drawing;
    this.parameter = diagram.parameter;
    this.willFilter = !!filter;
    this._once = false;
  }

  private comparsion(param: diagramParameter) {
    return match(param, {
      is: "object",
      require: this.parameter,
    });
  }

  draw(container: any, parameter: diagramParameter, pure: boolean = false) {
    try {
      let matched = !this.willFilter;
      if (this._once) {
        this._once = false;
        this.willFilter = false;
      }
      if (!matched) matched = this.comparsion(parameter);
      if (matched) {
        this.drawing(container, parameter);
      } else {
        throw new Exception(
          "DoNotMatched",
          "Parameter for drawing is not matched required condition",
          Exception.level.Warn
        );
      }
      return true;
    } finally {
      return false;
    }
  }

  filter() {
    this.willFilter = true;
  }

  once() {
    this.willFilter = true;
    this._once = true;
  }
}

export default Path;
