# react-native-webln

Library for handling all the boilerplate needed for supporting WebLN in a [react-native-webview](https://github.com/react-native-community/react-native-webview/),
so you can focus on actually implementing all the features of WebLN in your app or wallet.

Just plug and play.

# Getting Started

To use this library you also need to install `react-native-webview`. If you want Typescript typings, you need to install `webln`.

```sh
# Install react-native-webln and its peer dependencies
npm install --save react-native-webln react-native-webview

# If you want Typescript definitions
npm install --save-dev webln
```

or if you prefer Yarn.

```sh
# Install react-native-webln and its peer dependencies
yarn add react-native-webln react-native-webview

# If you want Typescript definitions
yarn add --dev webln
```


# Example

```tsx
import { injectJs, onMessageHandler } from "react-native-webln";

const WebLNBrowser = () => {
  const webview = useRef<WebView>();
  const [jsInjected, setJsInjected] = useState(false);

  return (
    <WebView
      ref={webview}
      source={{ uri: "https://webln-capable-site.com" }}
      onLoadStart={() => setJsInjected(false)}
      onLoadProgress={(e) => {
        if (!jsInjected && e.nativeEvent.progress > 0.75) {
          webview.current.injectJavaScript(injectJs());
          setJsInjected(true);
        }
      }}
      onMessage={onMessageHandler(webview, {
        enable: async () => { /* Your implementation goes here */ },
        getInfo: async () => { /* Your implementation goes here */ },
        makeInvoice: async (args) => { /* Your implementation goes here */ },
        sendPayment: async (paymentRequestStr) => { /* Your implementation goes here */ },
        signMessage: async (message) => { /* Your implementation goes here */ },
        verifyMessage: async (signature, message) => { /* Your implementation goes here */ },

        // Non-WebLN
        // Called when an a-tag containing a `lightning:` uri is found on a page
        foundInvoice: async (paymentRequestStr) => { /* Your implementation goes here */ }
      })}
      style={{ width: "100%", height: "100%", flex: 1 }}
    />
  )
}
```

# License

MIT
