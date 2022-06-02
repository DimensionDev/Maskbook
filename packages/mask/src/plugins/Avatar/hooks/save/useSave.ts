import { unreachable } from '@dimensiondev/kit'
import type { BindingProof, ECKeyIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import type { TwitterBaseAPI } from '@masknet/web3-providers'
import { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import type { NextIDAvatarMeta } from '../../types'
import { useSaveSolana } from './useSaveSolana'
import { useSaveToNextID } from './useSaveToNextID'
import { useSaveToRSS3 } from './useSAveToRSS3'

export type AvatarInfo = TwitterBaseAPI.AvatarInfo & { avatarId: string }

export function useSave() {
    const [, saveToNextID] = useSaveToNextID()
    const [, saveToRSS3] = useSaveToRSS3()
    const [, saveSolana] = useSaveSolana()

    return useAsyncFn(
        async (
            pluginId: NetworkPluginID,
            account: string,
            isBindAccount: boolean,
            token: NonFungibleToken<ChainId, SchemaType>,
            data: AvatarInfo,
            persona: ECKeyIdentifier,
            proof: BindingProof,
            identifier: ProfileIdentifier,
        ) => {
            if (!data || !token.contract?.address) return false

            const info: NextIDAvatarMeta = {
                pluginId,
                nickname: data.nickname,
                userId: data.userId,
                imageUrl: data.imageUrl,
                avatarId: data.avatarId,
                address: token.contract?.address,
                tokenId: token.tokenId,
                chainId: token.contract?.chainId ?? ChainId.Mainnet,
                schema: token.contract?.schema ?? SchemaType.ERC20,
            }

            switch (pluginId) {
                case NetworkPluginID.PLUGIN_SOLANA:
                    return saveSolana(info, account, persona, identifier, proof)
                case NetworkPluginID.PLUGIN_EVM: {
                    if (isBindAccount) {
                        return saveToNextID(info, persona, proof)
                    }
                    return saveToRSS3(info, account, identifier)
                }
                default:
                    unreachable(pluginId as never)
            }
        },
        [saveToNextID, saveToRSS3],
    )
}
