import type { api } from '@dimensiondev/mask-wallet-core/proto'

export namespace MaskBaseAPI {
    export type Input = { id: number; data: api.IMWRequest }
    export type Output = { id: number; response: api.MWResponse }
}
