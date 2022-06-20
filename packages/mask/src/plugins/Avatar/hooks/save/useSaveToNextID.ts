import { BindingProof, ECKeyIdentifier, EnhanceableSite, fromHex, toBase64 } from '@masknet/shared-base'
import { NextIDStorage } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import { Err } from 'ts-results'
import Services from '../../../../extension/service'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { PLUGIN_ID } from '../../constants'
import { PluginNFTAvatarRPC } from '../../messages'
import { AllNextIDAvatarMeta, NextIDAvatarMeta, SET_NFT_FLAG } from '../../types'

async function getBackgroundNFTInfo(persona: ECKeyIdentifier, proof: BindingProof) {
    const result = await NextIDStorage.getByIdentity<AllNextIDAvatarMeta>(
        persona.publicKeyAsHex,
        proof.platform,
        proof.identity,
        PLUGIN_ID,
    )
    if (!result.ok) return
    return result.val.background as NextIDAvatarMeta
}

async function getAvatarNFTInfo(persona: ECKeyIdentifier, proof: BindingProof) {
    const result = await NextIDStorage.getByIdentity<AllNextIDAvatarMeta>(
        persona.publicKeyAsHex,
        proof.platform,
        proof.identity,
        PLUGIN_ID,
    )
    if (!result.ok) return
    return result.val as NextIDAvatarMeta
}

async function setAvatarInfo(
    info: AllNextIDAvatarMeta,
    account: string,
    persona: ECKeyIdentifier,
    proof: BindingProof,
) {
    const payload = await NextIDStorage.getPayload(
        persona.publicKeyAsHex,
        proof?.platform,
        proof?.identity,
        info,
        PLUGIN_ID,
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
            PLUGIN_ID,
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
            flag: SET_NFT_FLAG,
        ) => {
            if (!proof?.identity || !persona?.publicKeyAsHex) return

            let tokenInfo: AllNextIDAvatarMeta
            if (flag === SET_NFT_FLAG.NFT_PFP) {
                const backgroundNFTInfo = await getBackgroundNFTInfo(persona, proof)
                tokenInfo = info
                if (backgroundNFTInfo) {
                    tokenInfo = Object.assign(info, { background: backgroundNFTInfo })
                }
            } else {
                const nftInfo = await getAvatarNFTInfo(persona, proof)
                if (nftInfo) {
                    tokenInfo = Object.assign(nftInfo, { background: info })
                } else {
                    tokenInfo = Object.assign({ ...info, avatarId: '', address: '', tokenId: '' }, { background: info })
                }
            }

            const response = await setAvatarInfo(tokenInfo, account, persona, proof)
            if (!response?.ok) {
                return
            }

            await PluginNFTAvatarRPC.setAddress(
                activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
                info.userId,
                info.pluginId ?? NetworkPluginID.PLUGIN_EVM,
                account,
                flag,
            )

            return response.ok
        },
        [],
    )
}
