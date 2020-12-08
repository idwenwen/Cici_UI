import Figure from "../figure/index";
import circle from "./circle";
import curve from "./curve";
import rect from "./rect";
import text from "./text";

Figure.Path.set(circle.name, circle.draw);
Figure.Path.set(curve.name, circle.draw);
Figure.Path.set(rect.name, rect.draw);
Figure.Path.set(text.name, text.draw);
