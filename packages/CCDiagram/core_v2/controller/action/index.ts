import { toAction } from "./action";
import { toChain } from "./chain";
import { Actable, ChainOrParallelAble } from "./declare";
import { toParallel } from "./parallel";

type LinkAction = {
  toChain?: boolean;
} & ChainOrParallelAble;

export type toActableType = LinkAction | Actable;

function toActable(setting: toActableType) {
  if ("toChain" in <LinkAction>setting || "list" in <LinkAction>setting) {
    return (<LinkAction>setting).toChain
      ? toParallel(setting)
      : toChain(setting);
  } else {
    return toAction(<Actable>setting);
  }
}

export { toAction, toChain, toParallel, toActable };
