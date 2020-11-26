import { animationInit } from "../animation/typeDeclare";
import { eventful } from "../event/typeDeclare";
import { diagram } from "../path/typeDeclare";

export type parameter = {
  path: string | diagram;
  imply: {
    [parameter: string]: any;
  };
  events?: {
    [eventType: string]: eventful | eventful[];
  };
  animations?: animationInit;
};
