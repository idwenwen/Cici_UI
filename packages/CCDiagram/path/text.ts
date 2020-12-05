export default {
  name: "text",
  draw: {
    path: function text(ctx: CanvasRenderingContext2D, par: any) {
      // TODO: 绘制字体
    },
    paramFilter: {
      center: `${"[]"} ${"number"} len ${"2"}`, // 终点位置。
      text: `${"string"}`, // 文字内容 其中可以传递换行符
      fontSize: "?number",
      maxWidth: "?number", // 最大长度，超出部分会进行自动换行。
      maxHeight: "?number", // 字段展示最大高度。
      lineHeight: "?number", // 每行高度
      color: `${"string"}`, // 当前长方形的内容。
    },
  },
};
