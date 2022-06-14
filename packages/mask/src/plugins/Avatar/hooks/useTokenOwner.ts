import { useAsyncRetry } from 'react-use'
import type { ChainId } from '@masknet/web3-shared-evm'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3Hub } from '@masknet/plugin-infra/web3'
import { activatedSocialNetworkUI } from '../../../social-network'
import { usePersonas } from './usePersonas'
import { PluginNFTAvatarRPC } from '../messages'
import type { EnhanceableSite } from '@masknet/shared-base'

export function useTokenOwner(
    address: string,
    tokenId: string,
    pluginId: NetworkPluginID,
    chainId?: ChainId,
    account?: string,
) {
    const hub = useWeb3Hub<'all'>(pluginId, {
        chainId,
        account,
    })

    return useAsyncRetry(async () => {
        if (!address || !tokenId || !hub?.getNonFungibleAsset) return
        const token = await hub.getNonFungibleAsset(address, tokenId, { chainId })
        return {
            owner: token?.owner?.address ?? token?.ownerId,
            name: token?.contract?.name,
            symbol: token?.contract?.symbol,
        }
    }, [hub, tokenId, address, account, chainId])
}

export function useCheckTokenOwner(pluginId: NetworkPluginID, userId: string, owner: string) {
    const { value: persona, loading } = usePersonas(userId)
    const { value: storage, loading: loadingAddress } = useAsyncRetry(
        async () =>
            PluginNFTAvatarRPC.getAddress(activatedSocialNetworkUI.networkIdentifier as EnhanceableSite, userId),
        [userId],
    )

    return {
        loading: loading || loadingAddress,
        isOwner: Boolean(
            (storage?.address && isSameAddress(storage.address, owner) && pluginId === storage.networkPluginID) ||
                persona?.wallets.some((x) => isSameAddress(x.identity, owner)),
        ),
    }
}
