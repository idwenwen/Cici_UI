/**
 * Exchange once attribute by atom action
 */

import Animate from "../animation/index";
import { callback } from "./typeDeclare";
import { toArray } from "lodash";
import eventing from "../heartBeat/index";
import Events from "./index";

function assignment(callback?: callback | callback[]) {
  const assignment = Animate.get(Animate.record.Assignment); // Get assignment Action
  eventing.push(assignment.act(toArray(callback))); // Added to commen heart beat
}

export function presetLogic() {
  Events.AtomLogic.set(["assignment"], [assignment]);
}
