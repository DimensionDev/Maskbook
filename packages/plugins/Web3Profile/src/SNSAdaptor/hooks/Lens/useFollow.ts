import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { useContract } from '@masknet/web3-hooks-evm'
import { Lens } from '@masknet/web3-providers'
import {
    ChainId,
    ContractTransaction,
    encodeTypedData,
    splitSignature,
    useLensConstants,
} from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { useQueryAuthenticate } from './useQueryAuthenticate.js'

import LensHubABI from '@masknet/web3-contracts/abis/LensHub.json'
import type { LensHub } from '@masknet/web3-contracts/types/LensHub.js'
import { type AbiItem } from 'web3-utils'
import { type NetworkPluginID } from '@masknet/shared-base'
import { type FollowModuleTypedData } from '@masknet/web3-providers/types'

export function useFollow(profileId?: string, followModule?: FollowModuleTypedData, onSuccess?: () => void) {
    const connection = useWeb3Connection()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [, handleQueryAuthenticate] = useQueryAuthenticate(account)
    const { LENS_HUB_PROXY_CONTRACT_ADDRESS } = useLensConstants(chainId)
    const lensHub = useContract<LensHub>(chainId, LENS_HUB_PROXY_CONTRACT_ADDRESS, LensHubABI as AbiItem[])

    return useAsyncFn(async () => {
        if (!profileId || !connection || chainId !== ChainId.Matic) return
        const token = await handleQueryAuthenticate()
        if (!token) return
        const typedData = await Lens.createFollowTypedData(profileId, { token, followModule })

        if (!typedData) return

        const signature = await connection.signMessage(
            'typedData',
            JSON.stringify(
                encodeTypedData(typedData.typedData.domain, typedData.typedData.types, typedData.typedData.value),
            ),
        )

        const { v, r, s } = splitSignature(signature)

        const { deadline, profileIds, datas } = typedData.typedData.value

        const tx = await new ContractTransaction(lensHub).fillAll(
            lensHub?.methods.followWithSig([account, profileIds, datas, [v, r, s, deadline]]),
            {
                from: account,
            },
        )

        const hash = await connection.sendTransaction(tx)
        const result = await connection.confirmTransaction(hash, {
            signal: AbortSignal.timeout(3 * 60 * 1000),
        })

        if (!result.status) return

        onSuccess?.()
    }, [handleQueryAuthenticate, profileId, connection, account, chainId, onSuccess])
}
