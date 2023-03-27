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
import { BroadcastType, ProxyActionType, type FollowModuleTypedData } from '@masknet/web3-providers/types'
import { useCallback } from 'react'
import { delay } from '@masknet/kit'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'

export function useFollow(profileId?: string, followModule?: FollowModuleTypedData, onSuccess?: () => void) {
    const connection = useWeb3Connection()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [, handleQueryAuthenticate] = useQueryAuthenticate(account)
    const { LENS_HUB_PROXY_CONTRACT_ADDRESS } = useLensConstants(chainId)
    const lensHub = useContract<LensHub>(chainId, LENS_HUB_PROXY_CONTRACT_ADDRESS, LensHubABI as AbiItem[])
    const { fetchJSON } = useSNSAdaptorContext()
    const followWithProxyAction = useCallback(
        async (token: string) => {
            try {
                if (!profileId || chainId !== ChainId.Matic || followModule || !connection) return
                const proxyAction = await Lens.followWithProxyAction(profileId, { token })
                if (!proxyAction) return
                for (let i = 0; i < 30; i += 1) {
                    const receipt = await Lens.queryProxyStatus(proxyAction, { token })
                    if (!receipt) return
                    switch (receipt.__typename) {
                        case ProxyActionType.ProxyActionError:
                            throw new Error(receipt.reason)
                        case ProxyActionType.ProxyActionQueued:
                            await delay(1000)
                            continue
                        case ProxyActionType.ProxyActionStatusResult:
                            const result = await connection.confirmTransaction(receipt.txHash)
                            if (!result.status) return
                            onSuccess?.()
                            return proxyAction
                        default:
                            // TODO: error
                            return
                    }
                }
                return
            } catch {
                return
            }
        },
        [profileId, chainId, followModule, connection],
    )

    return useAsyncFn(async () => {
        if (!profileId || !connection || chainId !== ChainId.Matic) return
        const token = await handleQueryAuthenticate()
        if (!token) return

        const proxyAction = await followWithProxyAction(token)

        if (!proxyAction) {
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

            let hash: string | undefined

            try {
                const broadcast = await Lens.broadcast(typedData.id, signature, { token, fetcher: fetchJSON })
                if (broadcast?.__typename === BroadcastType.RelayError) throw new Error(broadcast.reason)
                else hash = broadcast?.txHash
            } catch {
                const tx = await new ContractTransaction(lensHub).fillAll(
                    lensHub?.methods.followWithSig([account, profileIds, datas, [v, r, s, deadline]]),
                    {
                        from: account,
                    },
                )

                hash = await connection.sendTransaction(tx)
            }

            if (!hash) return
            const result = await connection.confirmTransaction(hash, {
                signal: AbortSignal.timeout(3 * 60 * 1000),
            })

            if (!result.status) return
            onSuccess?.()
        }
    }, [handleQueryAuthenticate, profileId, connection, account, chainId, onSuccess, fetchJSON])
}
