/**
 * APIs that both Android and iOS implements and have the same API signature
 */
export interface SharedNativeAPIs {}
/**
 * APIs that only implemented by iOS Mask Network
 */
export interface iOSNativeAPIs extends SharedNativeAPIs {
    /**
     * Open a full screen QR Code scanner.
     * @returns The scan result
     */
    scanQRCode(): Promise<string>
    log(...args: any[]): Promise<void>
}
/**
 * APIs that only implemented by Android Mask Network
 */
export interface AndroidNativeAPIs extends SharedNativeAPIs {
    android_echo(arg: string): Promise<string>
}
