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

    const connection = useWeb3Connection(pluginId)
    const wallets =
        persona?.binding?.proofs.filter((x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity)) ??
        EMPTY_LIST

    const { value, loading: loadingOwner } = useAsyncRetry(async () => {
        const token = await connection?.getNonFungibleToken(address, tokenId)
        const storage = await PluginNFTAvatarRPC.getAddress(
            activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
            userId,
        )
        if (storage?.address) {
            const isOwner = await connection?.getNonFungibleTokenOwnership(
                address,
                tokenId,
                storage.address,
                schemaType,
            )
            if (isOwner)
                return {
                    isOwner,
                    token,
                }
        }

        for (const wallet of wallets) {
            const isOwner = await connection?.getNonFungibleTokenOwnership(
                address,
                tokenId,
                wallet.identity,
                schemaType,
            )
            if (isOwner) return { isOwner, token }
        }
        return { isOwner: false, token }
    }, [address, tokenId, schemaType, connection, wallets])

    return {
        loading: loading || loadingOwner,
        isOwner: value?.isOwner,
        name: value?.token?.contract?.name ?? value?.token?.metadata?.name ?? '',
        symbol: value?.token?.contract?.symbol ?? 'ETH',
        schema: value?.token?.schema,
    }
}
