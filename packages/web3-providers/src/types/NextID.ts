import type { Result } from 'ts-results-es'
import type {
    NextIDAction,
    NextIDStoragePayload,
    NextIDPayload,
    NextIDPlatform,
    NextIDPersonaBindings,
} from '@masknet/shared-base'

export namespace NextIDBaseAPI {
    export interface LensAccount {
        handle: string
        displayName: string
        address: string
    }

    export interface Storage {
        set<T>(
            uuid: string,
            personaPublicKey: string,
            signature: string,
            platform: NextIDPlatform,
            identity: string,
            createdAt: string,
            patchData: unknown,
            pluginID: string,
        ): Promise<Result<T, null>>
        getByIdentity<T>(
            key: string,
            platform: NextIDPlatform,
            identity: string,
            pluginID: string,
        ): Promise<Result<T, string>>
        get<T>(key: string): Promise<Result<T, string>>
        getPayload(
            personaPublicKey: string,
            platform: NextIDPlatform,
            identity: string,
            patchData: unknown,
            pluginID: string,
        ): Promise<Result<NextIDStoragePayload, null>>
    }

    export interface Proof {
        bindProof(
            uuid: string,
            personaPublicKey: string,
            action: NextIDAction,
            platform: string,
            identity: string,
            createdAt: string,
            options?: {
                walletSignature?: string
                signature?: string
                proofLocation?: string
            },
        ): Promise<void>

        queryExistedBindingByPersona(personaPublicKey: string): Promise<any>

        queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page?: number): Promise<any>

        queryAllExistedBindingsByPlatform(platform: NextIDPlatform, identity: string): Promise<NextIDPersonaBindings[]>

        queryLatestBindingByPlatform(platform: NextIDPlatform, identity: string): Promise<NextIDPersonaBindings | null>

        queryIsBound(personaPublicKey: string, platform: NextIDPlatform, identity: string): Promise<boolean>

        createPersonaPayload(
            personaPublicKey: string,
            action: NextIDAction,
            identity: string,
            platform: NextIDPlatform,
            language?: string,
        ): Promise<NextIDPayload | null>
    }
}
