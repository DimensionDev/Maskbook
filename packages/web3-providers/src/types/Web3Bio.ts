import type { BindingProof } from '@masknet/shared-base'

export namespace Web3BioBaseAPI {
    export interface Profile {
        queryProfilesByAddress(address: string): Promise<BindingProof[]>
    }
}
