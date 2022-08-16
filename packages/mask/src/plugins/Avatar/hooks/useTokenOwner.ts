import { useAsyncRetry } from 'react-use'
import { isValidAddress, SchemaType } from '@masknet/web3-shared-evm'
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { activatedSocialNetworkUI } from '../../../social-network'
import { PluginNFTAvatarRPC } from '../messages'
import { EMPTY_LIST, EnhanceableSite, NextIDPlatform } from '@masknet/shared-base'
import type { NetworkPluginID, SocialIdentity } from '@masknet/web3-shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import type { IdentityResolved } from '@masknet/plugin-infra'
import Services from '../../../extension/service'

async function queryCurrentPersona(identityResolved: IdentityResolved) {
    if (!identityResolved.identifier) return
    const personaInformation = await Services.Identity.queryPersonaByProfile(identityResolved.identifier)
    if (!personaInformation?.identifier.publicKeyAsHex) return
    return NextIDProof.queryExistedBindingByPersona(personaInformation?.identifier.publicKeyAsHex)
}

export function useCheckTokenOwner(
    pluginId: NetworkPluginID,
    address: string,
    tokenId: string,
    schemaType: SchemaType,
    socialIdentity?: SocialIdentity,
) {
    const connection = useWeb3Connection(pluginId)

    return useAsyncRetry(async () => {
        if (!socialIdentity?.identifier?.userId || socialIdentity?.identifier.userId === '$unknown') return
        if (!address || !tokenId) return

        const token = await connection?.getNonFungibleToken(address, tokenId)

        const wallets =
            socialIdentity.binding?.proofs.filter(
                (x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity),
            ) ?? EMPTY_LIST

        const storage = await PluginNFTAvatarRPC.getAddress(
            activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
            socialIdentity.identifier?.userId ?? '',
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
                    name: token?.contract?.name ?? token?.metadata?.name ?? '',
                    symbol: token?.contract?.symbol ?? 'ETH',
                    schema: token?.schema,
                }
        }

        for (const wallet of wallets) {
            const isOwner = await connection?.getNonFungibleTokenOwnership(
                address,
                tokenId,
                wallet.identity,
                schemaType,
            )
            if (isOwner)
                return {
                    isOwner,
                    name: token?.contract?.name ?? token?.metadata?.name ?? '',
                    symbol: token?.contract?.symbol ?? 'ETH',
                    schema: token?.schema,
                }
        }
        return {
            isOwner: false,
            name: token?.contract?.name ?? token?.metadata?.name ?? '',
            symbol: token?.contract?.symbol ?? 'ETH',
            schema: token?.schema,
        }
    }, [address, tokenId, schemaType, connection, socialIdentity])
}
