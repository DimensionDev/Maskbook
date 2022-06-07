import type { BindingProof, ECKeyIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import type { TwitterBaseAPI } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import type { AllChainsNonFungibleToken, NextIDAvatarMeta } from '../../types'
import { useSaveSolana } from './useSaveSolana'
import { useSaveToNextID } from './useSaveToNextID'
import { useSaveToRSS3 } from './useSaveToRSS3'

export type AvatarInfo = TwitterBaseAPI.AvatarInfo & { avatarId: string }

export function useSave(pluginId: NetworkPluginID, chainId: ChainId) {
    const [, saveToNextID] = useSaveToNextID()
    const [, saveToRSS3] = useSaveToRSS3()
    const [, saveSolana] = useSaveSolana(pluginId, chainId)

    return useAsyncFn(
        async (
            account: string,
            isBindAccount: boolean,
            token: AllChainsNonFungibleToken,
            data: AvatarInfo,
            persona: ECKeyIdentifier,
            proof: BindingProof,
            identifier: ProfileIdentifier,
        ) => {
            if (pluginId === NetworkPluginID.PLUGIN_SOLANA)
                if (!token.tokenId) return
                else if (!token.contract?.address || !token.tokenId) return

            const info: NextIDAvatarMeta = {
                pluginId,
                nickname: data.nickname,
                userId: data.userId,
                imageUrl: data.imageUrl,
                avatarId: data.avatarId,
                address: token.contract?.address ?? '',
                tokenId: token.tokenId,
                chainId: (token.contract?.chainId ?? ChainId.Mainnet) as ChainId,
                schema: (token.contract?.schema ?? SchemaType.ERC721) as SchemaType,
            }

            console.log(pluginId)
            switch (pluginId) {
                case NetworkPluginID.PLUGIN_EVM: {
                    if (isBindAccount) {
                        return saveToNextID(info, persona, proof)
                    }
                    return saveToRSS3(info, account, identifier)
                }
                default:
                    return saveSolana(info, account, persona, identifier, proof)
            }
        },
        [saveToNextID, saveToRSS3, pluginId],
    )
}
