import type {
    JsonRpcPayload,
    JsonRpcResponse,
    PersonaRecord,
    PageOption,
    ProfileRecord,
    LinkedProfileDetails,
    RelationRecord,
    PostRecord,
} from './types'
import type { ProfileIdentifier_string } from './web'

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
    create_persona(params: { persona: PersonaRecord }): Promise<PersonaRecord | undefined>
    query_persona(params: {
        identifier?: string
        hasPrivateKey?: boolean
        includeLogout?: boolean
        nameContains?: string
        initialized?: boolean
        pageOption?: PageOption
    }): Promise<PersonaRecord>
    query_personas(params: {
        identifier?: string
        hasPrivateKey?: boolean
        includeLogout?: boolean
        nameContains?: string
        initialized?: boolean
        pageOption?: PageOption
    }): Promise<PersonaRecord[]>
    query_persona_by_profile(params: {
        options?: {
            profileIdentifier: string
            hasPrivateKey?: boolean
            includeLogout?: boolean
            nameContains?: string
            initialized?: boolean
            pageOption?: PageOption
        }
    }): Promise<PersonaRecord | undefined>
    update_persona(params: {
        persona: Partial<PersonaRecord>
        options?: {
            linkedProfileMergePolicy?: 0 | 1
            deleteUndefinedFields?: boolean
            createWhenNotExist?: boolean
        }
    }): Promise<void>
    delete_persona(params: { identifier: string; options?: { safeDelete?: boolean } }): Promise<void>
    create_profile(params: { profile: ProfileRecord }): Promise<ProfileRecord | undefined>
    query_profile(params: {
        options?: {
            identifier: string
            network?: string
            nameContains?: string
            pageOption?: PageOption
        }
    }): Promise<ProfileRecord | undefined>
    query_profiles(params: {
        identifiers?: string[]
        network?: string
        nameContains?: string
        hasLinkedPersona?: boolean
        pageOption?: PageOption
    }): Promise<ProfileRecord[]>
    update_profile(params: {
        profile: Partial<ProfileRecord>
        options?: {
            createWhenNotExist?: boolean
        }
    }): Promise<void>
    delete_profile(params: { identifier: string }): Promise<void>
    attach_profile(params: {
        profileIdentifier: string
        personaIdentifier: string
        state: LinkedProfileDetails
    }): Promise<void>
    detach_profile(params: { identifier: string }): Promise<void>
    create_relation(params: { relation: Omit<RelationRecord, 'network'> }): Promise<RelationRecord | undefined>
    query_relations(params: {
        options?: {
            personaIdentifier?: string
            network?: string
            nameContains?: string
            favor?: string
            pageOption?: PageOption
        }
    }): Promise<RelationRecord[]>
    update_relation(params: { relation: Omit<RelationRecord, 'network'> }): Promise<RelationRecord>
    delete_relation(params: { personaIdentifier: string; profileIdentifier: string }): Promise<void>
    query_avatar(params: { identifier: string }): Promise<string>
    store_avatar(params: { identifier: string; avatar: string }): Promise<void>
    create_post(params: { post: PostRecord }): Promise<PostRecord>
    query_post(params: { identifier: string }): Promise<PostRecord>
    query_posts(params: {
        encryptBy?: string
        userIds: string[]
        network?: string
        pageOption?: PageOption
    }): Promise<PostRecord[]>
    update_post(params: { post: Partial<PostRecord>; options: { mode: 0 | 1 } }): Promise<PostRecord[]>
    notify_visible_detected_profile_changed(newID: ProfileIdentifier_string): Promise<void>
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
