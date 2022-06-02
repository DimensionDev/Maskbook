import { useAsyncRetry } from 'react-use'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { activatedSocialNetworkUI } from '../../../social-network'
import { usePersonas } from './usePersonas'
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'
import { PluginNFTAvatarRPC } from '../messages'

export function useTokenOwner(address: string, tokenId: string, pluginId: NetworkPluginID, chainId?: ChainId) {
    const connection = useWeb3Connection(pluginId, { chainId })
    return useAsyncRetry(async () => {
        if (!address || !tokenId || !connection) return
        const token = await connection.getNonFungibleToken(address, tokenId)
        return { owner: token?.contract?.owner, name: token?.contract?.name, symbol: token?.contract?.symbol }
    }, [connection, tokenId, address])
}

export function useCheckTokenOwner(pluginId: NetworkPluginID, userId: string, owner?: string) {
    const { value: persona, loading } = usePersonas(userId)
    const { value: address, loading: loadingAddress } = useAsyncRetry(
        async () => PluginNFTAvatarRPC.getAddress(userId, activatedSocialNetworkUI.networkIdentifier, pluginId),
        [userId],
    )

    return {
        loading: loading || loadingAddress,
        isOwner: Boolean(
            (address && owner && isSameAddress(address, owner)) ||
                persona?.wallets.some((x) => isSameAddress(x.identity, owner)),
        ),
    }
}
