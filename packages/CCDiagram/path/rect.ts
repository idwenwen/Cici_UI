export default {
  name: "rect",
  draw: {
    path: function rect(ctx: CanvasRenderingContext2D, par: any) {
      let topLeft = [
        // 左上角坐标
        par.center[0] - par.width / 2,
        par.center[1] - par.height / 2,
      ];
      if (par.progress >= 0 || !par.progress) {
        let nowPos = [topLeft[0], topLeft[1] + par.radius]; // 启始位置点，第一个弧度的起始位置。
        ctx.moveTo(nowPos[0], nowPos[1]);

        // 绘制左上弧度
        // 绘制上边界
        // 绘制右上弧度
        // 绘制右边界
        // 绘制右下弧度
        // 绘制下边界
        // 绘制左下弧度
        // 绘制左边界
        par.stroke
          ? ((ctx.strokeStyle = par.color), ctx.stroke())
          : ((ctx.fillStyle = par.color), ctx.fill());
      }
    },
    paramFilter: {
      radius: `${"number"}`,
      width: `${"number"}`, // 长方形宽
      height: `${"number"}`, // 长方形高
      center: `${"[]"} ${"number"} len ${"2"}`, // 左上角点
      progress: `${"?number"} max ${1} min ${0}`, // 长方形完成度

      // 绘制方式
      stroke: `${"?boolean"}`, // 是否用stroke方式来绘制
      fill: `${"?boolean"}`, // 是否用fill方式来绘制

      // 绘制颜色
      color: `${"string"}`, // 当前长方形的内容。
    },
  },
};
