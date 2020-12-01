import { Exception } from "@cc/tools";

export function exception() {
  return new Exception(
    "DoNotMatched",
    "Do not matched preset condition",
    Exception.level.Error,
    false
  );
}
