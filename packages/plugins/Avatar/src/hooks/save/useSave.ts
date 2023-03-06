import { useAsyncFn } from 'react-use'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import { BindingProof, NetworkPluginID } from '@masknet/web3-shared-base'
import type { TwitterBaseAPI } from '@masknet/web3-providers/types'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { AllChainsNonFungibleToken, NextIDAvatarMeta } from '../../types.js'
import { useSaveKV } from './useSaveKV.js'
import { useSaveToNextID } from './useSaveToNextID.js'
import { useSaveToRSS3 } from './useSaveToRSS3.js'

export type AvatarInfo = TwitterBaseAPI.AvatarInfo & {
    avatarId: string
}

export function useSave(pluginID: NetworkPluginID) {
    const saveToNextID = useSaveToNextID()
    const saveToRSS3 = useSaveToRSS3()
    const saveToKV = useSaveKV(pluginID)

    return useAsyncFn(
        async (
            account: string,
            isBindAccount: boolean,
            token: AllChainsNonFungibleToken,
            data: AvatarInfo,
            persona: ECKeyIdentifier,
            proof: BindingProof,
        ) => {
            if (!token.contract?.address) return
            const info: NextIDAvatarMeta = {
                pluginId: pluginID,
                nickname: data.nickname,
                userId: data.userId,
                imageUrl: data.imageUrl,
                avatarId: data.avatarId,
                address: token.contract?.address ?? '',
                ownerAddress: account,
                tokenId: token.tokenId || token.id,
                chainId: (token.contract?.chainId ?? ChainId.Mainnet) as ChainId,
                schema: (token.contract?.schema ?? SchemaType.ERC721) as SchemaType,
            }

            try {
                switch (pluginID) {
                    case NetworkPluginID.PLUGIN_EVM: {
                        if (isBindAccount) {
                            const result = await saveToNextID(info, account, persona, proof)
                            return result
                        }
                        const result = await saveToRSS3(info, account)
                        return result
                    }
                    default:
                        const result = await saveToKV(info, account, persona, proof)
                        return result
                }
            } catch {
                return
            }
        },
        [saveToNextID, saveToRSS3, pluginID],
    )
}
