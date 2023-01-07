import type { SignType } from '@masknet/shared-base'

export namespace SignerAPI {
    export interface Provider {
        sign<T>(type: SignType, key: Buffer, message: T): Promise<string>
    }
}
