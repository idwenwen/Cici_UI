export function toRGBA(color) {
    const exchange = RGBToA(color);
    if (exchange !== false)
        return exchange;
    else {
        let origin = HEX3To6(color);
        const res = HEXToRGBA(origin);
        return res;
    }
}
export function toHEX(color) {
    const exchange = HEX3To6(color);
    if (exchange !== false)
        return exchange;
    else {
        let origin = RGBToA(color);
        const res = RGBAToHEX(origin);
        return res;
    }
}
function RGBToA(color) {
    const repRgb = /(?:\(|\)|rgb)*/g;
    color = color.toLowerCase();
    if (color.search("rgba") >= 0) {
        return color;
    }
    else if (color.search("rgb") >= 0) {
        return `rgba(${color.replace(repRgb, "")}, 1)`;
    }
    else {
        return false;
    }
}
function HEX3To6(color) {
    color = color.toLowerCase();
    if (color.search("rgb") >= 0) {
        return false;
    }
    else if (color.length === 4) {
        let newColor = "#";
        for (var i = 1; i < 4; i += 1) {
            newColor += color.slice(i, i + 1).concat(color.slice(i, i + 1));
        }
        return newColor;
    }
    else {
        return color;
    }
}
function HEXToRGBA(color) {
    const mid = RGBToA(color);
    if (mid === false) {
        color = HEX3To6(color);
        let colorChange = [];
        for (let i = 1; i < 7; i += 2) {
            colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
        }
        const res = "RGB(" + colorChange.join(",") + ")";
        return RGBToA(res);
    }
    else {
        return mid;
    }
}
function RGBAToHEX(color) {
    const mid = HEX3To6(color);
    if (mid === false) {
        color = RGBToA(color);
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
    }
    else {
        return mid;
    }
}
//# sourceMappingURL=color.js.map