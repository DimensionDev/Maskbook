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

    console.log('aaaaaaaaaaaaaaaaaaaaa')
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
            console.log('--------')
            console.log(pluginId)
            console.log(token)
            if (pluginId === NetworkPluginID.PLUGIN_SOLANA && !token.tokenId) return
            if (pluginId !== NetworkPluginID.PLUGIN_SOLANA && (!token.contract?.address || !token.tokenId)) return
            console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbb')
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
                default: {
                    const a = await saveSolana(info, account, persona, identifier, proof)
                    console.log('--------aaaaaa----------')
                    console.log(a)
                    return a
                }
            }
        },
        [saveToNextID, saveToRSS3, pluginId],
    )
}
