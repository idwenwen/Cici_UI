import array from "./array";
import object from "./object";
import number from "./number";
import string from "./string";
import { setting } from "../typeDeclare";

export function match(origin: any, setting: setting) {
  const filters = { array, object, number, string };
  return filters[setting.is](origin, setting);
}
