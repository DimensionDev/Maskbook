import { BindingProof, ECKeyIdentifier, EnhanceableSite, fromHex, toBase64 } from '@masknet/shared-base'
import { NextIDStorage } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import { Err } from 'ts-results'
import Services from '../../../../extension/service'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { PLUGIN_ID } from '../../constants'
import { PluginNFTAvatarRPC } from '../../messages'
import { NextIDAvatarMeta, NFT_USAGE } from '../../types'

async function setAvatarInfo(
    info: NextIDAvatarMeta,
    account: string,
    persona: ECKeyIdentifier,
    proof: BindingProof,
    nftUsage: NFT_USAGE,
) {
    const payload = await NextIDStorage.getPayload(
        persona.publicKeyAsHex,
        proof?.platform,
        proof?.identity,
        info,
        nftUsage === NFT_USAGE.NFT_BACKGROUND ? `${PLUGIN_ID}_background` : PLUGIN_ID,
    )
    if (!payload.ok) {
        return payload
    }
    try {
        const result = await Services.Identity.generateSignResult(persona, payload.val.signPayload)
        const response = await NextIDStorage.set(
            payload.val.uuid,
            persona.publicKeyAsHex,
            toBase64(fromHex(result.signature.signature)),
            proof.platform,
            proof.identity,
            payload.val.createdAt,
            info,
            nftUsage === NFT_USAGE.NFT_BACKGROUND ? `${PLUGIN_ID}_background` : PLUGIN_ID,
        )
        return response
    } catch (error) {
        return Err(error as string)
    }
}

export function useSaveToNextID() {
    return useAsyncFn(
        async (
            info: NextIDAvatarMeta,
            account: string,
            persona: ECKeyIdentifier,
            proof: BindingProof,
            nftUsage: NFT_USAGE,
        ) => {
            if (!proof?.identity || !persona?.publicKeyAsHex) return

            const response = await setAvatarInfo(info, account, persona, proof, nftUsage)
            if (!response?.ok) {
                return
            }

            await PluginNFTAvatarRPC.setAddress(
                activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
                info.userId,
                info.pluginId ?? NetworkPluginID.PLUGIN_EVM,
                account,
                nftUsage,
            )

            return response.ok
        },
        [],
    )
}
