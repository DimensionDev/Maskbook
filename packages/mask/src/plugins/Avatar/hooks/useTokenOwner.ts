import { useAsyncRetry } from 'react-use'
import { ChainId, isValidAddress } from '@masknet/web3-shared-evm'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3Hub } from '@masknet/plugin-infra/web3'
import { activatedSocialNetworkUI } from '../../../social-network'
import { EMPTY_LIST, EnhanceableSite, NextIDPlatform } from '@masknet/shared-base'
import { useCurrentVisitingSocialIdentity } from '../../../components/DataSource/useActivatedUI'
import { useGetAddress } from './useGetAddress'

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
    const { loading, value: persona } = useCurrentVisitingSocialIdentity()
    const getAddress = useGetAddress()
    const { value: storage, loading: loadingAddress } = useAsyncRetry(
        async () => getAddress(activatedSocialNetworkUI.networkIdentifier as EnhanceableSite, userId),
        [userId, getAddress],
    )
    const wallets =
        persona?.binding?.proofs.filter((x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity)) ??
        EMPTY_LIST

    return {
        loading: loading || loadingAddress,
        isOwner: Boolean(
            (storage?.address && isSameAddress(storage.address, owner) && pluginId === storage.networkPluginID) ||
                wallets.some((x) => isSameAddress(x.identity, owner)),
        ),
    }
}
