import type { api } from '@dimensiondev/mask-wallet-core/proto'

export namespace MaskBaseAPI {
    export interface Input {
        id: number
        data: api.IMWRequest
    }
    export interface Output {
        id: number
        response: api.MWResponse
    }
}
