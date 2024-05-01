import { type ECKeyIdentifier, NetworkPluginID, type BindingProof } from '@masknet/shared-base'
import type { AvatarNextID, TwitterBaseAPI } from '@masknet/web3-providers/types'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { AllChainsNonFungibleToken } from '../types.js'
import { useSaveKV } from './useSaveKV.js'
import { useSaveToNextID } from './useSaveToNextID.js'
import { useSaveStringStorage } from './useSaveStringStorage.js'
import { useCallback } from 'react'

export type AvatarInfo = TwitterBaseAPI.AvatarInfo & {
    avatarId: string
}

export function useSave(pluginID: NetworkPluginID) {
    const saveToNextID = useSaveToNextID()
    const saveToStringStorage = useSaveStringStorage(pluginID)
    const saveToKV = useSaveKV(pluginID)

    return useCallback(
        async (
            account: string,
            isBindAccount: boolean,
            token: AllChainsNonFungibleToken,
            data: AvatarInfo,
            persona: ECKeyIdentifier,
            proof?: BindingProof,
        ) => {
            if (!token.contract?.address) return
            const info: AvatarNextID<NetworkPluginID> = {
                pluginId: pluginID,
                nickname: data.nickname,
                userId: data.userId,
                imageUrl: data.imageUrl,
                avatarId: data.avatarId,
                address: token.contract.address,
                ownerAddress: account,
                tokenId: token.tokenId || token.id,
                chainId: (token.contract.chainId || ChainId.Mainnet) as ChainId,
                schema: (token.contract.schema || SchemaType.ERC721) as SchemaType,
            }

            try {
                switch (pluginID) {
                    case NetworkPluginID.PLUGIN_EVM: {
                        if (isBindAccount) return await saveToNextID(info, account, persona, proof)
                        return await saveToStringStorage(data.userId, account, info)
                    }
                    default:
                        return await saveToKV(info, account)
                }
            } catch {
                return
            }
        },
        [pluginID, saveToNextID, saveToStringStorage, saveToKV],
    )
}
