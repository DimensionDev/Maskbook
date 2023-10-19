import type { ProfileIdentifier } from '@masknet/base'
import type { NextIDPersonaBindings } from '../NextID/types.js'
import type { NetworkPluginID } from '../index.js'

export enum SocialAddressType {
    Address = 'Address',
    ENS = 'ENS',
    ARBID = 'ARBID',
    SPACE_ID = 'SPACE_ID',
    RSS3 = 'RSS3',
    SOL = 'SOL',
    NEXT_ID = 'NEXT_ID',
    CyberConnect = 'CyberConnect',
    Firefly = 'Firefly',
    Leaderboard = '.eth Leaderboard',
    OpenSea = 'OpenSea',
    Sybil = 'Sybil',
    TwitterBlue = 'TwitterBlue',
    Mask = 'Mask Network',
    Lens = 'Lens',
    Crossbell = 'Crossbell',
}

export interface SocialIdentity {
    /** The identifier of the social account */
    identifier?: ProfileIdentifier
    /** The avatar image link of the social account */
    avatar?: string
    /** The bio content of the social account */
    bio?: string
    /** The nickname of the social account */
    nickname?: string
    /** The homepage link of the social account */
    homepage?: string
    /** Has a NextID binding or not */
    hasBinding?: boolean
    /** The public key of persona in hex */
    publicKey?: string
    /** Is own user account identity */
    isOwner?: boolean
    /** All bindings of the persona  **/
    binding?: NextIDPersonaBindings
}

/**
 * The smallest unit of a social account. This type only for internal usage.
 * The SocialAccount serves for UI usage.
 */
export interface SocialAddress<ChainId> {
    /** The ID of a plugin that the address belongs to */
    pluginID: NetworkPluginID
    /** The chain id that the address belongs to, default support all chains */
    chainId?: ChainId
    /** The data source type */
    type: SocialAddressType
    /** The address in hex string */
    address: string
    /** A human readable address title */
    label: string
    /** Last updated timestamp (unix timestamp) */
    updatedAt?: string
    /** Create timestamp (unix timestamp) */
    createdAt?: string
    /** Data from official sources indicate validation, e.g. twitter blue  */
    verified?: boolean
}

/**
 * The social account that merged from multiple social addresses.
 * This type only for UI usage.
 */
export interface SocialAccount<ChainId> extends Omit<SocialAddress<ChainId>, 'type'> {
    supportedAddressTypes?: SocialAddressType[]
    /** The chain ids that the address supported, default support all chains */
    supportedChainIds?: ChainId[]
}
