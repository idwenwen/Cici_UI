import { each, Exception, Mapping } from "@cc/tools";
import { Combinable } from "./typeDeclare";
import {
  eventful,
  eventParameter,
  eventType,
  presetlogic,
} from "./typeDeclare";
import { isObject, toArray, capacity } from "lodash";
import { presetLogic } from "./atomChange";
import { getAction } from "../animation/action";
import Animate from "../animation/index";

/**
 * Events manager for diagram
 */
class Events {
  static AtomLogic: Mapping<string, presetlogic> = new Mapping();
  static TYPE: eventType = {};

  static set(name: string, preset: presetlogic) {
    Events.AtomLogic.set(name, preset);
    Events.TYPE[capacity(name)] = name;
  }

  static get(name: string) {
    try {
      if (Events.TYPE[capacity(name)]) {
        return Events.AtomLogic.get(name);
      } else {
        throw new Exception(
          "HasNoEvent",
          `There has no event named ${name}`,
          Exception.level.Warn
        );
      }
    } finally {
      return void 0;
    }
  }

  eventList: Mapping<string, eventful | eventful[]>;
  constructor(events: eventParameter) {
    this.eventList = new Mapping();
    this.addEvent(events);
  }

  addEvent(name: string, operation: eventful);
  addEvent(name: eventParameter, operation?: undefined);
  addEvent(name: Combinable, operation: Combinable) {
    if (isObject(name)) {
      return this.eventList.set(Object.keys(name), Object.values(name));
    } else {
      return this.eventList.set(name, operation);
    }
  }

  removeEvent(name: string);
  removeEvent(name: string[]);
  removeEvent(name: Combinable) {
    let needToDo = toArray(name);
    this.eventList.delete(needToDo);
  }

  dispatch(name: string, ...args: any[]) {
    let eve = this.eventList.get(name);
    try {
      if (!eve) {
        throw new Exception(
          "HasNoEvent",
          "There has no relative event",
          Exception.level.Warn
        );
      }
      eve = toArray(eve);
      each(eve)((event) => {
        const animate = Animate.get("assignment");
        animate.once(() => {
          event.call(null, ...args);
        });
      });
    } finally {
      return void 0;
    }
  }
}

presetLogic();

export default Events;
