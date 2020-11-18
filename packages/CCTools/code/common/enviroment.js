import { Setting } from "../config/config";
import { display } from "./exception";
var Browser;
(function (Browser) {
    Browser["Chrome"] = "Chrome";
    Browser["Safari"] = "Safari";
    Browser["FireFox"] = "FireFox";
    Browser["Opera"] = "Opera";
    Browser["Edge"] = "Edge";
})(Browser || (Browser = {}));
class Enviroment {
    constructor() {
        window &&
            ((this.isNode = false), (this.isBrowser = true), (this.isOther = false));
        global &&
            ((this.isNode = true), (this.isBrowser = false), (this.isOther = false));
        !window &&
            !global &&
            ((this.isNode = false), (this.isBrowser = false), (this.isOther = true));
        this.isNode && this.nodeDetail();
        this.isBrowser && this.browserDetail();
        if (!Setting.production) {
            display.log(`Current enviroment: ${this.isNode ? "node" : this.isBrowser ? "browser" : "other"}
      suppiler: ${this.supplier || "unknow"}
      version: ${this.version || "unknow"}`);
        }
    }
    nodeDetail() {
        this.version = process.version;
        this.supplier = "node";
    }
    browserDetail() {
        const userAgent = window.navigator.userAgent;
        const findIndex = (reg) => userAgent.search(reg);
        const versionGetter = (start, replaceer, end) => {
            const mid = end
                ? userAgent.substring(start, end)
                : userAgent.substring(start);
            return mid.replace(replaceer, "");
        };
        let startIndex = -1;
        let endIndex = -1;
        let version = "";
        let supplier = "";
        if ((startIndex = findIndex(/Chrome\/([\d.]+)/)) >= 0) {
            endIndex = findIndex("Safari");
            version = versionGetter(startIndex, "Chrome/", endIndex);
            supplier = Browser.Chrome;
        }
        else if ((startIndex = findIndex("Firefox")) >= 0) {
            version = versionGetter(startIndex, "Firefox/");
            supplier = Browser.FireFox;
        }
        else if ((startIndex = findIndex("Edge")) >= 0) {
            version = versionGetter(startIndex, "Edge/");
            supplier = Browser.Edge;
        }
        else if ((startIndex = findIndex(/Version\/([\d.]+).*Safari/)) >= 0) {
            version = versionGetter(startIndex, /(Version|\.*Safari)/g);
            supplier = Browser.Safari;
        }
        else if ((startIndex = findIndex(/Opera.([\d.]+)/)) >= 0) {
            version = versionGetter(startIndex, /(Opera\.)|\//g);
            supplier = Browser.Opera;
        }
        if (version && supplier) {
            this.version = version;
            this.supplier = supplier;
        }
        else {
            this.version = null;
            this.supplier = null;
            this.isBrowser = false;
            this.isOther = true;
        }
    }
}
const enviroment = new Enviroment();
export default enviroment;
//# sourceMappingURL=enviroment.js.map