import type { Result } from 'ts-results'
import type {
    NextIDAction,
    NextIDStoragePayload,
    NextIDPayload,
    NextIDPlatform,
    NextIDPersonaBindings,
} from '@masknet/shared-base'

export namespace NextIDBaseAPI {
    export interface Storage {
        set<T>(
            uuid: string,
            personaPublicKey: string,
            signature: string,
            platform: NextIDPlatform,
            identity: string,
            createdAt: string,
            patchData: unknown,
            pluginId: string,
        ): Promise<Result<T, string>>
        getByIdentity<T>(
            key: string,
            platform: NextIDPlatform,
            identity: string,
            pluginId: string,
        ): Promise<Result<T, string>>
        get<T>(key: string): Promise<Result<T, string>>
        getPayload(
            personaPublicKey: string,
            platform: NextIDPlatform,
            identity: string,
            patchData: unknown,
            pluginId: string,
        ): Promise<Result<NextIDStoragePayload, string>>
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
        ): Promise<Result<unknown, string>>

        queryExistedBindingByPersona(personaPublicKey: string, enableCache?: boolean): Promise<any>

        queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page?: number): Promise<any>

        queryAllExistedBindingsByPlatform(platform: NextIDPlatform, identity: string): Promise<NextIDPersonaBindings[]>

        queryIsBound(
            personaPublicKey: string,
            platform: NextIDPlatform,
            identity: string,
            enableCache?: boolean,
        ): Promise<boolean>

        createPersonaPayload(
            personaPublicKey: string,
            action: NextIDAction,
            identity: string,
            platform: NextIDPlatform,
            language?: string,
        ): Promise<NextIDPayload | null>
    }
}
