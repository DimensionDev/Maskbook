import { useBlockedFungibleTokens } from '@masknet/plugin-infra/web3'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'

export const useTokenBlocked = (address: string) => {
    const blockedFungibleTokens = useBlockedFungibleTokens(NetworkPluginID.PLUGIN_EVM)

    return !!blockedFungibleTokens?.find((x) => isSameAddress(x.address, address))
}
