declare const _default: "(() => {\n    \"use strict\";\n    if (!window.ReactNativeWebView) {\n        return;\n    }\n    window.WebLN = window.WebLN || {};\n    const WebLNPromiseCallback = {};\n    const timeout = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));\n    let requestId = 0;\n    let weblnEnabled = false;\n    window.WebLN.requestProvider = (async () => {\n        if (weblnEnabled) {\n            return window.WebLN;\n        }\n        const webln = {\n            enable: async () => { return; },\n            getInfo: async () => {\n                return await postMessage({\n                    type: \"getInfo\",\n                    data: null,\n                });\n            },\n            makeInvoice: async (args) => {\n                const result = await postMessage({\n                    type: \"makeInvoice\",\n                    data: args,\n                });\n                checkedInvoices.push((\"lightning:\" + result.paymentRequest).toUpperCase());\n                return result;\n            },\n            sendPayment: async (paymentRequest) => {\n                return await postMessage({\n                    type: \"sendPayment\",\n                    data: paymentRequest,\n                });\n            },\n            signMessage: async () => {\n                return {\n                    message: \"\",\n                    signature: \"\",\n                };\n            },\n            verifyMessage: async () => {\n                return;\n            },\n        };\n        window.WebLN = { ...window.WebLN, ...webln };\n        weblnEnabled = true;\n        return webln;\n    });\n    const postMessage = async (message, waitForCallback = true) => {\n        const currentId = requestId++;\n        window.ReactNativeWebView.postMessage(JSON.stringify({\n            ...message,\n            id: currentId,\n        }));\n        if (!waitForCallback) {\n            return;\n        }\n        while (!WebLNPromiseCallback[currentId]) {\n            await timeout(1000);\n        }\n        if (WebLNPromiseCallback[currentId] instanceof Error) {\n            throw WebLNPromiseCallback[currentId];\n        }\n        return WebLNPromiseCallback[currentId];\n    };\n    document.addEventListener(\"webln\", (event) => {\n        WebLNPromiseCallback[event.detail.id] = event.detail.data;\n    });\n    const checkedInvoices = [];\n    if (window.reactNativeWebLNCheckTags) {\n        const checkATags = async () => {\n            if (weblnEnabled) {\n                return;\n            }\n            const aTags = document.querySelectorAll(\"a\");\n            for (const aTag of aTags) {\n                if (aTag.href &&\n                    aTag.href.toUpperCase().startsWith(\"LIGHTNING:\") &&\n                    aTag.href.length > \"LIGHTNING:\".length) {\n                    debug(\"Found: \" + aTag.href);\n                    const invoice = aTag.href.toUpperCase().replace(\"LIGHTNING:\", \"\");\n                    if (checkedInvoices.includes(invoice)) {\n                        return;\n                    }\n                    checkedInvoices.push(invoice);\n                    await postMessage({\n                        type: \"nonwebln_foundInvoice\",\n                        data: invoice\n                    }, false);\n                    break;\n                }\n            }\n        };\n        const check = setInterval(() => {\n            if (weblnEnabled) {\n                clearInterval(check);\n            }\n            checkATags();\n        }, 1250);\n    }\n    const debug = async (message) => {\n        if (window.reactNativeWebLNDebug) {\n            await postMessage({\n                type: \"debug\",\n                data: message,\n            }, false);\n        }\n    };\n})();";
export default _default;