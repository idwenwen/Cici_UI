import { each } from "@cc/tools";
import { Diagram, toPanel } from "../main";

function getPos(ev) {
  let x, y;
  if (ev.layerX || ev.layerX === 0) {
    x = ev.layerX;
    y = ev.layerY;
  } else if (ev.offsetX || ev.offsetY === 0) {
    x = ev.offsetX;
    y = ev.offsetY;
  }
  return [x, y];
}

const canvas = {
  id: "canvasTesting",
  width: 300,
  height: 100,
  style: {
    width: "300px",
    height: "100px",
    position: "absolute",
    top: "100px",
    left: "100px",
    border: "1px solid red",
  },
  class: ["testStyle"],
  transform: {
    rotate: 15,
  },
  events: {
    click: function (eve) {
      each(this.diagram)((dia: Diagram) => {
        dia.dispatchEvent()("click", getPos(eve));
      });
    },
    mouseover: function (eve) {
      each(this.diagram)((dia: Diagram) => {
        dia.dispatchEvent()("mouseover", getPos(eve));
      });
    },
  },
  diagram: {
    components: {
      parameter: {
        width: function () {
          return this.style ? parseInt(this.style.width) - 20 : 100;
        },
        height: function () {
          return this.style ? parseInt(this.style.height) - 20 : 100;
        },
        center: function () {
          return this.style
            ? [parseInt(this.style.width) / 2, parseInt(this.style.height) / 2]
            : [50, 50];
        },
        radius: 5,
      },
      events: {
        click: function (eve, point) {
          if (this["isPointInPath"](point)) {
            console.log("Clicked point in path");
          } else {
            console.log("Clicked point out of path");
          }
          //@ts-ignore 调用loading动画。
          this["origin"].animationOperation("dispatch")("loading");
        },
      },
      children: [
        {
          parameter: {
            text: "running",
            center: function () {
              return this.center;
            },
            color: "#cccccc",
          },
          path: "text",
          events: {
            mouseover: function (eve, point) {
              if (this["isPointInPath"](point)) {
                this.color = "#778899";
              } else {
                this.color = "#cccccc";
              }
            },
          },
        },
        {
          parameter: {
            width: function () {
              return this.width - 20;
            },
            height: function () {
              return this.height - 20;
            },
            radius: function () {
              return this.radius;
            },
            center: function () {
              return this.center;
            },
            stroke: true,
            color: "#11EE3D",
          },
          path: "rect",
          events: {
            click: function (eve, point) {
              if (this["isPointInPath"](point)) {
                this.color = "#494ece";
              } else {
                this.color = "#11ee3d";
              }
            },
          },
        },
      ],
    },
  },
};

const panel = toPanel(canvas);
export default panel;
