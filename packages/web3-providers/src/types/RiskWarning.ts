export namespace RiskWarningBaseAPI {
    export interface Provider {
        approve(address: string, pluginID?: string): Promise<void>
    }
}
