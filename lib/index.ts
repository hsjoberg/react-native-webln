export * from "./postMessage-handler";

import WebviewInjection from "./inject-txt";

export interface InjectJsOptions {
  debug?: boolean;
  checkTags?: boolean;
}
export const injectJs = (options: InjectJsOptions = { debug: false, checkTags: true }) => {
  const pre =
    `window.reactNativeWebLNDebug = ${!!options.debug};
     window.reactNativeWebLNCheckTags = ${!!options.checkTags};`;

  return pre + WebviewInjection;
}