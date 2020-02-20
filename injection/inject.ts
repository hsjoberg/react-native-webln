import { requestProvider, WebLNProvider, RequestInvoiceResponse } from "webln";

declare global {
  interface Window {
    ReactNativeWebView: any;
    WebLN: WebLNProvider & { requestProvider: typeof requestProvider; };
    reactNativeWebLNDebug?: boolean;
    reactNativeWebLNCheckTags?: boolean;
  }
}

interface PostMessage {
  id?: number;
  type: keyof WebLNProvider | "nonwebln_foundInvoice" | "debug";
  data: any;
}

// Code to be injected into the webview.
// window.requestProvider() sets every API function up.
//
// For each API-function postMessage() is called with
// the correspoding data for each request.
//
// postMessage() supplies the request back to the host where
// it will be processed. As everything is asynchronous,
// once react is done, window.WebLNPromiseCallback object will be
// injected with the response, which the webview code will poll.
(() => {
  "use strict";
  if (!window.ReactNativeWebView) {
    return;
  }
  window.WebLN = window.WebLN || {};
  const WebLNPromiseCallback: { [key: string]: Promise<any> } = {};
  const timeout = (time: number) => new Promise((resolve) => setTimeout(() => resolve(), time));
  let requestId = 0;
  let weblnEnabled = false;

  window.WebLN.requestProvider = (async () => {
    if (weblnEnabled) {
      return window.WebLN;
    }

    const webln: WebLNProvider = {
      enable: async () => { return; },
      getInfo: async () => {
        return await postMessage({
          type: "getInfo",
          data: null,
        });
      },
      makeInvoice: async (args) => {
        const result: RequestInvoiceResponse = await postMessage({
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
      signMessage: async () => {
        return {
          message: "",
          signature: "",
        };
      },
      verifyMessage: async () => {
        return;
      },
    };
    window.WebLN = { ...window.WebLN, ...webln };
    weblnEnabled = true;
    return webln;
  }) as typeof requestProvider;

  const postMessage = async (message: PostMessage, waitForCallback = true) => {
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
  }

  document.addEventListener("webln", (event: any) => {
    WebLNPromiseCallback[event.detail.id] = event.detail.data;
  });

  // Other stuff than WebLN
  const checkedInvoices: string[] = [];
  if (window.reactNativeWebLNCheckTags) {
    const checkATags = async () => {
      if (weblnEnabled) {
        return;
      }

      const aTags = document.querySelectorAll("a");
      for (const aTag of aTags) {
        if (
          aTag.href &&
          aTag.href.toUpperCase().startsWith("LIGHTNING:") &&
          aTag.href.length > "LIGHTNING:".length
        ) {
          debug("Found: " + aTag.href);
          const invoice = aTag.href.toUpperCase().replace("LIGHTNING:", "");
          if (checkedInvoices.includes(invoice)) {
            return;
          }
          checkedInvoices.push(invoice);
          await postMessage({
            type: "nonwebln_foundInvoice",
            data: invoice
          }, false);
          break;
        }
      }
    }

    const check = setInterval(() => {
      if (weblnEnabled) {
        clearInterval(check);
      }
      checkATags();
    } , 1250);
  }

  const debug = async (message: string) => {
    if (window.reactNativeWebLNDebug) {
      await postMessage({
        type: "debug",
        data: message,
      }, false);
    }
  };
})();