import type { api } from '@dimensiondev/mask-wallet-core/proto'

export namespace MaskBaseAPI {
    export type Input = { id: number; data: api.IMWRequest }
    export type Output = { id: number; response: api.MWResponse }

    export type Request = InstanceType<typeof api.MWRequest>
    export type Response = InstanceType<typeof api.MWResponse>

    export type StoredKeyInfo = api.IStoredKeyInfo

    export interface Provider {}
}
