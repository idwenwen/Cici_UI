import { Combinable, callback } from "../config/commenType";

export { Combinable, callback };

export type eventful = (...args: any[]) => any;
export type presetlogic = (cb: callback | callback[]) => any;

export type eventParameter = {
  [name: string]: eventful | eventful[];
};
export type eventType = {
  [type: string]: string;
};
