export * from "./postMessage-handler";
export interface InjectJsOptions {
    debug?: boolean;
    checkTags?: boolean;
}
export declare const injectJs: (options?: InjectJsOptions) => string;
