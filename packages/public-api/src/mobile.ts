import type { JsonRpcPayload, JsonRpcResponse, PersonaRecord, PageOption, ProfileRecord } from './types'

/**
 * APIs that both Android and iOS implements and have the same API signature
 */
export interface SharedNativeAPIs {
    /**
     * Send Ethereum JSON RPC
     */
    send(payload: JsonRpcPayload): Promise<JsonRpcResponse>
    wallet_switchBlockChain(payload: { coinId?: number; networkId: number }): Promise<void>
    misc_openCreateWalletView(): Promise<void>
    misc_openDashboardView(): Promise<void>
    /**
     * DB JSON RPC
     */
    query_persona(params: {
        identifier?: string
        hasPrivateKey?: boolean
        includeLogout?: boolean
        nameContains?: string
        pageOption?: PageOption
    }): Promise<PersonaRecord>
    query_personas(params: {
        identifier?: string
        hasPrivateKey?: boolean
        includeLogout?: boolean
        nameContains?: string
        pageOption?: PageOption
    }): Promise<PersonaRecord[]>
    update_persona(params: {
        persona: PersonaRecord
        options: {
            linkedProfileMergePolicy?: 0 | 1
            deleteUndefinedFields?: boolean
            protectPrivateKey?: boolean
            createWhenNotExist?: boolean
        }
    }): Promise<void>
    delete_persona(params: { identifier: string; options: { safeDelete?: boolean } }): Promise<void>
    query_profiles(params: {
        identifier?: string
        network?: string
        nameContains?: string
        pageOption: PageOption
    }): Promise<ProfileRecord>
    update_profile(params: {
        profile: ProfileRecord
        options: {
            createWhenNotExist?: boolean
        }
    }): Promise<void>
    delete_profile(params: { identifier: string }): Promise<void>
    attachProfile(params: {
        profileIdentifier: string
        personaIdentifier: string
        state: string // ?
    }): Promise<void>
    deattachProfile(params: { identifier: string }): Promise<void>
}
/**
 * APIs that only implemented by iOS Mask Network
 */
export interface iOSNativeAPIs extends SharedNativeAPIs {}
/**
 * APIs that only implemented by Android Mask Network
 */
export interface AndroidNativeAPIs extends SharedNativeAPIs {
    sendJsonString(payload: string): Promise<string>
}
