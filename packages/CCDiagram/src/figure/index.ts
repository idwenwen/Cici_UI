import { Tree } from "@cc/tools";
import Animate from "../animation/index";
import Events from "../event/index";
import Path from "../path/index";
import Parameter, { getParameter } from "../parameter/index";
import { parameter } from "./typeDesclare";
import Matrix from "../matrix/index";
import { getSketchPad } from "../sketchPad/index";

/**
 * Component instance manager each Graphic disassembly
 */
class Figure extends Tree {
  animations: Animate;
  events: Events;
  path: Path;
  parameter: Parameter; // paramter for drawing
  matrix: Matrix; // transform

  container: any;

  constructor(
    container: any, // CanvasRenderingContext2d or svg
    status: parameter,
    parent?: Figure,
    children?: Figure | Figure[]
  ) {
    super(parent, children);
    this.matrix = new Matrix();
    this.container = container; // Diagram container
    status.animations && (this.animations = new Animate(status.animations));
    status.events && (this.events = new Events(status.events));
    this.path = status.path ? new Path(status.path) : null;
    this.parameter = getParameter(this, status.imply);
  }

  set parent(parentNode: Figure) {
    super.parent = parentNode;
    this.parameter["origin"].connectTo();
    this.matrix = parentNode.matrix;
  }

  drawing() {
    // Drawing all
    this.matrix.transform(this.container);
    this.notify(
      (node: Figure) => {
        node.path && node.path.draw(this.container, this.parameter);
      },
      true,
      false,
      true
    );
    this.matrix.reset(this.container);
  }

  inn(point: [number, number]) {
    const sketchpad = getSketchPad();
    this.notify((node: Figure) => {
      node.path && node.path.draw();
    });
  }
}

export default Figure;
