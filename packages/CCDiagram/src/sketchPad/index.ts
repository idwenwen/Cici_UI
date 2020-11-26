let sketchPad = null;

export function getSketchPad() {
  if (!sketchPad) {
    const dom = document.createElement("canvas");
    dom.setAttribute("width", "100");
    dom.setAttribute("height", "100");
    sketchPad = dom;
  }
  const ctx = sketchPad.getContext("2d");
  ctx.restore();
  ctx.save();
  return ctx;
}
