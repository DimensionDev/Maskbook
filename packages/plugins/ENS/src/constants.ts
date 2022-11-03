import { PluginID } from '@masknet/shared-base'
import { SourceType } from '@masknet/web3-shared-base'

/**
 * !! This ID is used to identify the stored plugin data. Change it will cause data lost.
 */
export const ENS_PluginID = PluginID.ENS

export const ENS_CONTRACT_ADDRESS = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'

export const SUPPORTED_SOURCE_TYPES = [
    SourceType.OpenSea,
    SourceType.NFTScan,
    SourceType.Gem,
    SourceType.Rarible,
    // SourceType.X2Y2,
    // SourceType.NFTScan,
    // SourceType.Zora,
    // SourceType.LooksRare,
]
