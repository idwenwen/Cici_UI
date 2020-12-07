import { defNoEnum, each, Exception, Tree } from "@cc/tools";
import { Combinable, Point } from "../commonType";
import DrawPath, {
  PathDependence,
  PathDrawing,
  Paths,
} from "../drawPath/index";
import { isObject, isFunction } from "lodash";
import Events, { EventOperations } from "../events/index";
import Animate, {
  animateSetting,
  AnimationOperation,
} from "../animation/index";
import { toParameter } from "../parameter/index";
import { Watching } from "../../observer/watcher";
import { is } from "../../utils/index";
import { acquistion } from "../config/common";
import Progress from "../controller/progress";
import Transform from "../Transform/index";

export type FigureSetting = {
  parameter: Paths;
  path?: string | PathDrawing; // 当前层可以没有相关的路径绘制参数
  events?: EventOperations;
  animate?: animateSetting;
  children?: FigureSetting[];
};

export enum AnimationExtension {
  Add = "add",
  Remove = "remove",
}

class Figure extends Tree {
  static Progress = Progress; // 提供设置接口
  static Path = DrawPath; // 提供设置接口

  _display: boolean; // 当前figure是否展示。
  drawPath?: DrawPath; // 表示的是当前绘制路径内容。

  // 当前绘制路径变形设置。
  transform?: Transform;
  parameter: any; // 相关的对象内容。
  events: Events;
  animation: Animate;

  constructor(
    imply: object, //映射列表
    path?: string | PathDrawing | PathDependence, // 当前内容不一定存在path内容。
    events?: EventOperations,
    animate?: animateSetting,

    parent?: Figure,
    children?: Figure | Figure[],

    display: boolean = true
  ) {
    super(parent, children);
    defNoEnum(this, {
      _display: display,
    });
    this.drawPath = path ? new DrawPath(path) : null;
    // 新增parameter内容，关联上下文内容
    this.connection(imply);

    const proxy = this.figureProxy();
    this.events = new Events(proxy, events);
    this.animation = new Animate(proxy, animate);
  }

  /****************parameter 相关操作与关联关系 ********************/
  // 更新或者创建parameter内容。
  connection(implying?: object | Function) {
    const context = this.parent.parameter; // 自动与上层的parameter相关联
    if (this.parameter) {
      this.parameter["context$"] = context; // 更新当前的上下文环境 如果有改变的话。
    } else {
      // 生成新的parameter对象内容
      this.parameter = toParameter(implying, context);
      // 监听当前parameter的变动，并依据变动添加当前内容到绘制列表之中
      this.parameter["origin"].subscribe(
        Watching(
          this.parameter,
          () => {
            Object.keys(this); // 调用一下代理的和获取方法，绑定当前watcher内容。
            return this;
          },
          (_result) => {
            // 需要将当前figure添加到重绘之中去。
          }
        )
      );
    }
  }

  // 更新当前Figure的参数映射内容
  represent(name: string, value: any);
  represent(name: object | Function, value?: undefined);
  represent(name: Combinable, value: Combinable) {
    if (isObject(name)) {
      each(name)((val, key) => {
        this.parameter[key] = val;
      });
    } else if (isFunction(name)) {
      this.parameter["represent$"] = name;
    } else {
      this.parameter[name] = value;
    }
  }

  /***************************当前对象层级关系设置 **********************/
  // 设置父节点，并更新parameter的相关参数。
  set parent(newValue: Figure) {
    super.parent = newValue;
    this.connection();
  }

  // 代理方法,开放指定的相关参数给到调用方，限制接口展示方便获取。
  private figureProxy() {
    const CustomerHandler = {
      set(target: Figure, key: string, value: any) {
        return (target.parameter[key] = value);
      },
      get(target: Figure, key: string) {
        if (is(key, "isPointInFigure")) {
          return (point: Point, ctx: CanvasRenderingContext2D) => {
            return target.isPointInFigure(point, ctx);
          };
        } else {
          return target.parameter[key];
        }
      },
    };
    return acquistion(this, CustomerHandler);
  }

  set display(showing: boolean) {
    // 当前节点与子节点全部隐藏
    if (showing !== this.display) {
      this.notify(() => {
        this._display = showing;
      }, false);
    }
  }

  get display() {
    return this._display;
  }

  isPointInFigure(point: Point, ctx: CanvasRenderingContext2D) {
    let result = false;
    this.notify(() => {
      if (this.drawPath && this.display)
        this.drawPath.drawing(ctx, this.parameter, {
          afterDraw: (ctxx: CanvasRenderingContext2D) => {
            result = ctxx.isPointInPath(point[0], point[1]);
            if (result)
              throw new Exception(
                "PointInPath",
                "Breaking current iteration",
                Exception.level.Info,
                false
              );
          },
        });
    }, false);
  }

  // 传递画笔并绘制当前内容，树的层级越高，绘制的层级也相对越高。
  drawing(ctx: CanvasRenderingContext2D) {
    // 以广度遍历的形式从下往上绘制内容。
    this.notify(
      () => {
        this.display &&
          this.drawPath &&
          this.drawPath.drawing(ctx, this.parameter); // 当前节点的绘制
      },
      true,
      false,
      true
    );
  }

  // 开始动画操作。
  animationOperation(operation: AnimationOperation | AnimationExtension) {
    // 当且仅当operation为add的时候name才可能是animateSetting的类型。
    return (name: string | animateSetting, ...meta: any[]) => {
      if (operation in AnimationOperation) {
        this.notify(
          () => {
            // @ts-ignore meta用来传递多个参数，但不一定有参数内容，依据的接口内容进行传递。
            this.animation[<AnimationOperation>operation](name, ...meta);
          },
          false,
          false,
          false
        );
      } else {
        // @ts-ignore 如果为remove的时候只有第一个参数有用，如果过为add方法的时候则需要多个参数。
        this.animation[<AnimationExtension>operation](name, ...meta);
      }
    };
  }

  // 事件触发。
  dispatchEvents(name: string, point: Point, ...meta: any[]) {
    this.notify(
      () => {
        this.events.dispatch(name, point, ...meta);
      },
      false,
      false,
      false
    );
  }
}

export default Figure;

// 依据获取内容。
export function toFigure(setting: FigureSetting) {
  const figure = new Figure(
    setting.parameter,
    setting.path,
    setting.events,
    setting.animate
  );
  if (setting.children && setting.children.length > 0) {
    each(setting.children)((set) => {
      figure.child = toFigure(set);
    });
  }
  return figure;
}
