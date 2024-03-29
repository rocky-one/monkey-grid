declare module '*.css' {
    const content: any;
    export default content;
}

declare module '*.less' {
    const content: any;
    export default content;
}

declare interface Window {
    clipboardData: any;
    __MonkeyGrid__Instance: any
}

declare interface Document {
    selection: any
}
