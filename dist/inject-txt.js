"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `(() => {
    "use strict";
    if (!window.ReactNativeWebView) {
        return;
    }
    const WebLNPromiseCallback = {};
    const timeout = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));
    let requestId = 0;
    let weblnEnabled = false;
    window.webln = {
        enable: async () => {
            if (document.domain !== "tippin.me") {
                weblnEnabled = true;
            }
            return;
        },
        getInfo: async () => {
            return await postMessage({
                type: "getInfo",
                data: null,
            });
        },
        makeInvoice: async (args) => {
            const result = await postMessage({
                type: "makeInvoice",
                data: args,
            });
            checkedInvoices.push(("lightning:" + result.paymentRequest).toUpperCase());
            return result;
        },
        sendPayment: async (paymentRequest) => {
            return await postMessage({
                type: "sendPayment",
                data: paymentRequest,
            });
        },
        signMessage: async (message) => {
            return await postMessage({
                type: "signMessage",
                data: message,
            });
        },
        verifyMessage: async (signature, message) => {
            return await postMessage({
                type: "verifyMessage",
                data: {
                    signature,
                    message,
                },
            });
        },
    };
    const postMessage = async (message, waitForCallback = true) => {
        const currentId = requestId++;
        window.ReactNativeWebView.postMessage(JSON.stringify({
            ...message,
            id: currentId,
        }));
        if (!waitForCallback) {
            return;
        }
        while (!WebLNPromiseCallback[currentId]) {
            await timeout(1000);
        }
        if (WebLNPromiseCallback[currentId] instanceof Error) {
            throw WebLNPromiseCallback[currentId];
        }
        return WebLNPromiseCallback[currentId];
    };
    document.addEventListener("webln", (event) => {
        WebLNPromiseCallback[event.detail.id] = event.detail.data;
    });
    const checkedInvoices = [];
    if (window.reactNativeWebLNCheckTags) {
        const checkATags = async () => {
            const aTags = document.querySelectorAll("a");
            for (const aTag of aTags) {
                if (aTag.href &&
                    aTag.href.toUpperCase().startsWith("LIGHTNING:") &&
                    aTag.href.length > "LIGHTNING:".length) {
                    const invoice = aTag.href.toUpperCase().replace("LIGHTNING:", "");
                    if (checkedInvoices.includes(invoice)) {
                        return;
                    }
                    if (weblnEnabled && invoice.startsWith("LNBC")) {
                        return;
                    }
                    debug("Found: " + aTag.href);
                    checkedInvoices.push(invoice);
                    await postMessage({
                        type: "nonwebln_foundInvoice",
                        data: invoice
                    }, false);
                    break;
                }
            }
        };
        setInterval(() => {
            checkATags();
        }, 850);
    }
    const debug = async (message) => {
        if (window.reactNativeWebLNDebug) {
            await postMessage({
                type: "debug",
                data: message,
            }, false);
        }
    };
})();`;
//# sourceMappingURL=inject-txt.js.map