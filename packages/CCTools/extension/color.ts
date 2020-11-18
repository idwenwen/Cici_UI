/**
 * Common colors, functional like below:
 *
 */
export function toRGBA(color: string): string {
  const exchange = RGBToA(color);
  if (exchange !== false) return <string>exchange;
  else {
    let origin: string = <string>HEX3To6(color);
    const res = HEXToRGBA(origin);
    return res;
  }
}

export function toHEX(color: string): string {
  const exchange = HEX3To6(color);
  if (exchange !== false) return <string>exchange;
  else {
    let origin: string = <string>RGBToA(color);
    const res = RGBAToHEX(origin);
    return <string>res;
  }
}

/**
 * RGBA format
 * @param color GRB or RGBA
 */
function RGBToA(color: string): string | boolean {
  const repRgb = /(?:\(|\)|rgb)*/g;
  color = color.toLowerCase();
  if (color.search("rgba") >= 0) {
    // Already be rgba-format
    return color;
  } else if (color.search("rgb") >= 0) {
    // It is rgb
    return `rgba(${color.replace(repRgb, "")}, 1)`;
  } else {
    return false;
  }
}

/**
 * HEX fromat
 * @param color Hex color of three digit number
 */
function HEX3To6(color: string): string | boolean {
  color = color.toLowerCase();
  if (color.search("rgb") >= 0) {
    return false;
  } else if (color.length === 4) {
    let newColor = "#";
    for (var i = 1; i < 4; i += 1) {
      newColor += color.slice(i, i + 1).concat(color.slice(i, i + 1));
    }
    return newColor;
  } else {
    return color;
  }
}

/**
 * Hex six digit to rgba
 * @param color HEX color
 */
function HEXToRGBA(color: string): string {
  const mid = RGBToA(color);
  if (mid === false) {
    color = <string>HEX3To6(color);
    let colorChange = [];
    for (let i = 1; i < 7; i += 2) {
      colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
    }
    const res = "RGB(" + colorChange.join(",") + ")";
    return <string>RGBToA(res);
  } else {
    return <string>mid;
  }
}

/**
 * RGBA-color to hex six digit
 * @param color RGBA COLOR
 */
function RGBAToHEX(color: string) {
  const mid = HEX3To6(color);
  if (mid === false) {
    color = <string>RGBToA(color);
    let colorChange = "#";
    let colorArr = color.replace(/(?:\(|\)|rgb|rgba)*/g, "").split(",");
    colorArr.splice(colorArr.length - 1, 1);
    for (var i = 0; i < colorArr.length; i++) {
      var hex = Number(colorArr[i]).toString(16);
      if (hex === "0") {
        hex += hex;
      }
      colorChange += hex;
    }
    return HEX3To6(colorChange);
  } else {
    return mid;
  }
}
