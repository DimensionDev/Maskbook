import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isSameAddress } from '@masknet/web3-shared-base'

export function isSameNFT(
    pluginID: NetworkPluginID,
    a: Web3Helper.NonFungibleAssetAll,
    b?: Web3Helper.NonFungibleAssetAll,
) {
    if (pluginID === NetworkPluginID.PLUGIN_SOLANA) return a.tokenId === b?.tokenId && a.id === b.id
    if (!a.contract || !b?.contract) return false
    return (
        isSameAddress(a.contract.address, b.contract.address) &&
        a.contract.chainId === b.contract.chainId &&
        a.tokenId === b.tokenId
    )
}
