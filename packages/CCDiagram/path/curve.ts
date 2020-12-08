import { each } from "@cc/tools";

export default {
  name: "arc",
  draw: {
    path: function arc(ctx: CanvasRenderingContext2D, par: any) {
      each(par.point)((point, i) => {
        const x = point[0] || 0;
        const y = point[1] || 0;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          if (par.point[i + 1]) {
            let endX = 0;
            let endY = 0;
            if (par.point[i + 2]) {
              endX = (x + (par.point[i + 1].x || par.point[i + 1][0])) / 2;
              endY = (y + (par.point[i + 1].y || par.point[i + 1][1])) / 2;
            } else {
              endX = par.point[i + 1].x || par.point[i + 1][0];
              endY = par.point[i + 1].y || par.point[i + 1][1];
            }
            ctx.quadraticCurveTo(x, y, endX, endY);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      par.dash && ctx.setLineDash(par.dash);
      ctx.stroke();
    },
    paramFilter: {
      points: `${"[[number, number]]"}`,
      color: `number`,
      dash: `[number]`,
    },
  },
};
