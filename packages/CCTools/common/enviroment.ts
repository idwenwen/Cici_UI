import { Setting } from "../config/config";
import { display } from "./exception";

/**
 * Get info form current enviroment.
 */
enum Browser {
  Chrome = "Chrome",
  Safari = "Safari",
  FireFox = "FireFox",
  Opera = "Opera",
  Edge = "Edge",
}

class Enviroment {
  // Enviroment judge condition
  isNode: boolean;
  isBrowser: boolean;
  isOther: boolean;

  // Detail info
  version: string;
  supplier: string;

  // Current Utils do support
  isSupport: boolean;

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
      display.log(`Current enviroment: ${
        this.isNode ? "node" : this.isBrowser ? "browser" : "other"
      }
      suppiler: ${this.supplier || "unknow"}
      version: ${this.version || "unknow"}`);
    }
  }

  // Access version and supplier for node
  private nodeDetail() {
    this.version = process.version;
    this.supplier = "node";
  }

  // Access version and supplier according userAgent
  private browserDetail() {
    const userAgent = window.navigator.userAgent;
    const findIndex = (reg: RegExp | string) => userAgent.search(reg);
    const versionGetter = (
      start: number,
      replaceer: RegExp | string,
      end?: number
    ) => {
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
    } else if ((startIndex = findIndex("Firefox")) >= 0) {
      // Firefox Checking
      version = versionGetter(startIndex, "Firefox/");
      supplier = Browser.FireFox;
    } else if ((startIndex = findIndex("Edge")) >= 0) {
      // IE-EDGE Checking
      version = versionGetter(startIndex, "Edge/");
      supplier = Browser.Edge;
    } else if ((startIndex = findIndex(/Version\/([\d.]+).*Safari/)) >= 0) {
      // Safari Checking
      version = versionGetter(startIndex, /(Version|\.*Safari)/g);
      supplier = Browser.Safari;
    } else if ((startIndex = findIndex(/Opera.([\d.]+)/)) >= 0) {
      version = versionGetter(startIndex, /(Opera\.)|\//g);
      supplier = Browser.Opera;
    }
    if (version && supplier) {
      this.version = version;
      this.supplier = supplier;
    } else {
      this.version = null;
      this.supplier = null;
      this.isBrowser = false;
      this.isOther = true;
    }
  }
}

const enviroment = new Enviroment();

export default enviroment;
