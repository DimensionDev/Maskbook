import { useAsyncRetry } from 'react-use'
import { isValidAddress, type SchemaType } from '@masknet/web3-shared-evm'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import {
    EMPTY_LIST,
    type EnhanceableSite,
    NextIDPlatform,
    type NetworkPluginID,
    getSiteType,
    type SocialIdentity,
} from '@masknet/shared-base'
import { useGetAddress } from './useGetAddress.js'

export function useCheckTokenOwner(
    pluginID: NetworkPluginID,
    address: string,
    tokenId: string,
    schemaType: SchemaType,
    socialIdentity?: SocialIdentity,
) {
    const Web3 = useWeb3Connection(pluginID)
    const getAddress = useGetAddress()

    return useAsyncRetry(async () => {
        if (!socialIdentity?.identifier?.userId || socialIdentity.identifier.userId === '$unknown') return
        if (!address || !tokenId) return

        const token = await Web3.getNonFungibleToken(address, tokenId)

        const wallets =
            socialIdentity.binding?.proofs.filter(
                (x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity),
            ) ?? EMPTY_LIST

        const storage = await getAddress(getSiteType() as EnhanceableSite, socialIdentity.identifier.userId ?? '')
        if (storage?.address) {
            const isOwner = await Web3.getNonFungibleTokenOwnership(address, tokenId, storage.address, schemaType)
            if (isOwner)
                return {
                    isOwner,
                    name: token.contract?.name ?? token.metadata?.name ?? '',
                    symbol: token.contract?.symbol ?? 'ETH',
                    schema: token.schema,
                }
        }

        for (const wallet of wallets) {
            const isOwner = await Web3.getNonFungibleTokenOwnership(address, tokenId, wallet.identity, schemaType)
            if (isOwner)
                return {
                    isOwner,
                    name: token.contract?.name ?? token.metadata?.name ?? '',
                    symbol: token.contract?.symbol ?? 'ETH',
                    schema: token.schema,
                }
        }
        return {
            isOwner: false,
            name: token.contract?.name ?? token.metadata?.name ?? '',
            symbol: token.contract?.symbol ?? 'ETH',
            schema: token.schema,
        }
    }, [address, tokenId, schemaType, socialIdentity, Web3])
}
