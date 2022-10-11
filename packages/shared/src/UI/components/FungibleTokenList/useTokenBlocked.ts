import { useBlockedFungibleTokens, useTrustedFungibleTokens } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export const useTokenBlocked = (address: string) => {
    const blockedFungibleTokens = useBlockedFungibleTokens(NetworkPluginID.PLUGIN_EVM, undefined)

    return !!blockedFungibleTokens?.find((x) => isSameAddress(x.address, address))
}

export const useTokenTrusted = (address: string, chainId: ChainId) => {
    const trustedFungibleTokens = useTrustedFungibleTokens(NetworkPluginID.PLUGIN_EVM, undefined, chainId)

    return !!trustedFungibleTokens?.find((x) => isSameAddress(x.address, address))
}
