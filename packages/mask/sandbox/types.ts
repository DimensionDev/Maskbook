export type IframeToMain = BridgeServiceRequest
export interface BridgeServiceRequest {
    type: 'service'
    name: string
    data: unknown
}

export type MainToIframe = BridgeServiceResponse
export interface BridgeServiceResponse {
    type: 'service'
    name: string
    data: unknown
}
