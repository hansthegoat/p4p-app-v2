import { r as reactExports } from "./react.mjs";
import { k as isPlainObject, s as applySdkMetadata, af as setContext, a7 as setNormalizeStringifier } from "./sentry__core.mjs";
import { i as init$1, n as normalizeStringifyValue$1 } from "./sentry__browser.mjs";
function isSyntheticEvent(wat) {
  return isPlainObject(wat) && "nativeEvent" in wat && "preventDefault" in wat && "stopPropagation" in wat;
}
function init(options) {
  const opts = {
    ...options
  };
  applySdkMetadata(opts, "react");
  setContext("react", { version: reactExports.version });
  const client = init$1(opts);
  setNormalizeStringifier(normalizeStringifyValue);
  return client;
}
function normalizeStringifyValue(value) {
  if (isSyntheticEvent(value)) {
    return "[SyntheticEvent]";
  }
  return normalizeStringifyValue$1(value);
}
export {
  init as i
};
