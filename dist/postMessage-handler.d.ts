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
declare const postMessageHandler: (webview: MutableRefObject<WebView>, requests: WebLNProviderWithExtras) => (event: WebViewMessageEvent) => Promise<void>;
export { postMessageHandler, };
