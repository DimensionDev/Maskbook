import type { BindingProof, ECKeyIdentifier } from '@masknet/shared-base'
import type { TwitterBaseAPI } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import type { AllChainsNonFungibleToken, NextIDAvatarMeta } from '../../types.js'
import { useSaveKV } from './useSaveKV.js'
import { useSaveToNextID } from './useSaveToNextID.js'
import { useSaveToRSS3 } from './useSaveToRSS3.js'

export type AvatarInfo = TwitterBaseAPI.AvatarInfo & {
    avatarId: string
}

export function useSave(pluginId: NetworkPluginID, chainId: ChainId) {
    const saveToNextID = useSaveToNextID()
    const saveToRSS3 = useSaveToRSS3()
    const saveToKV = useSaveKV(pluginId)

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
                pluginId,
                nickname: data.nickname,
                userId: data.userId,
                imageUrl: data.imageUrl,
                avatarId: data.avatarId,
                address: token.contract?.address ?? '',
                contractName: token.contract?.name ?? '',
                ownerAddress: account,
                tokenId: token.tokenId || token.id,
                chainId: (token.contract?.chainId ?? ChainId.Mainnet) as ChainId,
                schema: (token.contract?.schema ?? SchemaType.ERC721) as SchemaType,
            }

            try {
                switch (pluginId) {
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
        [saveToNextID, saveToRSS3, pluginId],
    )
}
