"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./postMessage-handler"));
const inject_txt_1 = require("./inject-txt");
exports.injectJs = (options = { debug: false, checkTags: true }) => {
    const pre = `window.reactNativeWebLNDebug = ${options.debug ?? false};
     window.reactNativeWebLNCheckTags = ${options.checkTags ?? true};`;
    return pre + inject_txt_1.default;
};
//# sourceMappingURL=index.js.map