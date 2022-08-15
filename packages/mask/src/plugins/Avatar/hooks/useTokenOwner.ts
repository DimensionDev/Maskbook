import { useAsyncRetry } from 'react-use'
import { isValidAddress, SchemaType } from '@masknet/web3-shared-evm'
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { activatedSocialNetworkUI } from '../../../social-network'
import { PluginNFTAvatarRPC } from '../messages'
import { EMPTY_LIST, EnhanceableSite, NextIDPlatform } from '@masknet/shared-base'
import { useCurrentVisitingSocialIdentity } from '../../../components/DataSource/useActivatedUI'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

export function useCheckTokenOwner(
    pluginId: NetworkPluginID,
    userId: string,
    address: string,
    tokenId: string,
    schemaType: SchemaType,
) {
    const { loading, value: persona } = useCurrentVisitingSocialIdentity()
    const { value: storage, loading: loadingAddress } = useAsyncRetry(
        async () =>
            PluginNFTAvatarRPC.getAddress(activatedSocialNetworkUI.networkIdentifier as EnhanceableSite, userId),
        [userId],
    )
    const connection = useWeb3Connection(pluginId)
    const wallets =
        persona?.binding?.proofs.filter((x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity)) ??
        EMPTY_LIST

    const { value: isOwner, loading: loadingOwner } = useAsyncRetry(async () => {
        if (storage?.address) {
            const isOwner = await connection?.getNonFungibleTokenOwnership(
                address,
                tokenId,
                storage.address,
                schemaType,
            )
            if (isOwner) return true
        }

        for (const wallet of wallets) {
            const isOwner = await connection?.getNonFungibleTokenOwnership(
                address,
                tokenId,
                wallet.identity,
                schemaType,
            )
            if (isOwner) return true
        }
        return false
    }, [address, tokenId, schemaType, connection])

    const { value: token, loading: loadingToken } = useAsyncRetry(
        async () => connection?.getNonFungibleToken(address, tokenId),
        [address, tokenId, connection],
    )

    return {
        loading: loading || loadingAddress || loadingOwner || loadingToken,
        isOwner,
        name: token?.contract?.name ?? token?.metadata?.name ?? '',
        symbol: token?.contract?.symbol ?? 'ETH',
        schema: token?.schema,
    }
}
