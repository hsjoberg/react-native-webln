import { MutableRefObject } from "react";
import { WebLNProvider } from "webln";
import { WebView, WebViewMessageEvent } from 'react-native-webview';
export interface PostMessage {
  id?: number;
  type: keyof WebLNProvider | "nonwebln_foundInvoice" | "debug";
  data: any;
}

export interface WebLNProviderWithExtras extends WebLNProvider {
  foundInvoice?: (paymentRequestStr: string) => Promise<void>;
}

const postMessageHandler = (webview: MutableRefObject<WebView>, requests: WebLNProviderWithExtras) => async (event: WebViewMessageEvent) => {
  if (!webview.current) {
    console.error(
      "react-native-webln: Reference to webview is not properly set.\n" +
      "postMessageHandler needs to have a ref to webview in other to work"
    );
  }

  requests.foundInvoice = requests.foundInvoice || (async () => {});

  const request = JSON.parse(event.nativeEvent.data);
  const id = request.id;

  switch (request.type) {
    case "debug": {
      console.log("Debug", request);
      break;
    }
    case "getInfo": {
      try {
        const response = await requests.getInfo();
        injectResponseToWebView(webview.current, id, JSON.stringify(response));
      } catch (e) {
        injectResponseToWebView(webview.current, id, new Error(e.message));
      }
      break;
    }
    case "makeInvoice": {
      console.log("handle makeInvoice");

      try {
        const response = await requests.makeInvoice(request.data);
        injectResponseToWebView(webview.current, id, JSON.stringify(response));
      } catch (e) {
        injectResponseToWebView(webview.current, id, new Error(e.message));
      }
      break;
    }
    case "sendPayment": {
      console.log("handler sendPayment");

      try {
        const response = await requests.sendPayment(request.data);
        injectResponseToWebView(webview.current, id, JSON.stringify(response));
      } catch (e) {
        injectResponseToWebView(webview.current, id, new Error(e.message));
      }
      break;
    }
    case "signMessage": {
      injectResponseToWebView(webview.current, id, new Error("Not implemented."));
      break;
    }
    case "verifyMessage": {
      injectResponseToWebView(webview.current, id, new Error("Not implemented."));
      break;
    }

    case "nonwebln_foundInvoice": {
      try {
        await requests.foundInvoice(request.data);
      } catch (e) {
        console.log(`nonwebln_foundInvoice failed: ${e.message}`);
      }
    }
  }
}

const injectResponseToWebView = (webview: WebView, id: number, inject: string | Error) => {
  console.log("inject");
  webview.injectJavaScript(
    `document.dispatchEvent(
      new CustomEvent("webln", {
        detail: {
          id: "${id}",
          data: ${inject instanceof Error ? `new Error("${inject.message}")` : inject}
        }
      })
    );`
  );
}

export {
  postMessageHandler,
}