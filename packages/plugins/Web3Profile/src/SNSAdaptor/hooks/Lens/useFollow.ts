import { useCallback, useRef, type MouseEvent, useState } from 'react'
import { cloneDeep } from 'lodash-es'
import { type AbiItem } from 'web3-utils'
import { delay } from '@masknet/kit'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useContract } from '@masknet/web3-hooks-evm'
import { Lens, Web3 } from '@masknet/web3-providers'
import {
    ChainId,
    ContractTransaction,
    encodeTypedData,
    splitSignature,
    useLensConstants,
} from '@masknet/web3-shared-evm'
import LensHubABI from '@masknet/web3-contracts/abis/LensHub.json'
import type { LensHub } from '@masknet/web3-contracts/types/LensHub.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { BroadcastType, ProxyActionType, type FollowModuleTypedData } from '@masknet/web3-providers/types'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { type SnackbarKey, useCustomSnackbar, type SnackbarMessage, type ShowSnackbarOptions } from '@masknet/theme'
import { useQueryAuthenticate } from './useQueryAuthenticate.js'
import { useI18N } from '../../../locales/i18n_generated.js'

export function useFollow(
    profileId?: string,
    followModule?: FollowModuleTypedData,
    hasDefaultProfile?: boolean,
    onSuccess?: (event: MouseEvent<HTMLElement>) => void,
    onFailed?: () => void,
) {
    const [loading, setLoading] = useState(false)
    const t = useI18N()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const handleQueryAuthenticate = useQueryAuthenticate(account)
    const { LENS_HUB_PROXY_CONTRACT_ADDRESS } = useLensConstants(chainId)
    const lensHub = useContract<LensHub>(chainId, LENS_HUB_PROXY_CONTRACT_ADDRESS, LensHubABI as AbiItem[])
    const { fetchJSON } = useSNSAdaptorContext()

    const snackbarKeyRef = useRef<SnackbarKey>()
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()

    const showSingletonSnackbar = useCallback(
        (title: SnackbarMessage, options: ShowSnackbarOptions) => {
            if (snackbarKeyRef.current !== undefined) closeSnackbar(snackbarKeyRef.current)
            snackbarKeyRef.current = showSnackbar(title, options)
            return () => {
                closeSnackbar(snackbarKeyRef.current)
            }
        },
        [showSnackbar, closeSnackbar],
    )

    const followWithProxyAction = useCallback(
        async (token: string) => {
            if (!profileId || chainId !== ChainId.Matic || followModule || !hasDefaultProfile) return
            return Lens.followWithProxyAction(profileId, { token })
        },
        [profileId, chainId, followModule, hasDefaultProfile],
    )

    const queryProxyActionStatus = useCallback(async (token: string, proxyAction?: string) => {
        if (!proxyAction) return

        for (let i = 0; i < 30; i += 1) {
            const status = await Lens.queryProxyStatus(proxyAction, { token })
            if (!status) return
            switch (status.__typename) {
                case ProxyActionType.ProxyActionError:
                    throw new Error(status.reason)
                case ProxyActionType.ProxyActionQueued:
                    await delay(1000)
                    continue
                case ProxyActionType.ProxyActionStatusResult:
                    const receipt = await Web3.confirmTransaction(status.txHash)
                    if (!receipt.status) return
                    return proxyAction
                default:
                    // TODO: error
                    return
            }
        }

        return
    }, [])

    const handleFollow = useCallback<(event: MouseEvent<HTMLElement>) => Promise<void>>(
        async (event: MouseEvent<HTMLElement>) => {
            const cloneEvent = cloneDeep(event)

            try {
                setLoading(true)
                if (!profileId || chainId !== ChainId.Matic) return
                const token = await handleQueryAuthenticate()
                if (!token) return
                const proxyAction = await followWithProxyAction(token)
                if (proxyAction) {
                    onSuccess?.(cloneEvent)
                    setLoading(false)
                }

                const result = await queryProxyActionStatus(token, proxyAction)

                if (!result) {
                    setLoading(true)
                    const typedData = await Lens.createFollowTypedData(profileId, { token, followModule })

                    if (!typedData) return

                    const signature = await Web3.signMessage(
                        'typedData',
                        JSON.stringify(
                            encodeTypedData(
                                typedData.typedData.domain,
                                typedData.typedData.types,
                                typedData.typedData.value,
                            ),
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
                        onFailed?.()
                        const tx = await new ContractTransaction(lensHub).fillAll(
                            lensHub?.methods.followWithSig([account, profileIds, datas, [v, r, s, deadline]]),
                            {
                                from: account,
                            },
                        )

                        hash = await Web3.sendTransaction(tx)
                    }

                    if (!hash) return
                    onSuccess?.(cloneEvent)
                    setLoading(false)

                    const receipt = await Web3.confirmTransaction(hash, {
                        signal: AbortSignal.timeout(3 * 60 * 1000),
                    })
                    if (!receipt.status) throw new Error('Failed to Follow')
                }
            } catch (error) {
                if (
                    error instanceof Error &&
                    !error.message.includes('Transaction was rejected') &&
                    !error.message.includes('Signature canceled') &&
                    !error.message.includes('User rejected the request') &&
                    !error.message.includes('User rejected transaction') &&
                    !error.message.includes('RPC Error')
                ) {
                    onFailed?.()
                    showSingletonSnackbar(t.follow_lens_handle(), {
                        processing: false,
                        variant: 'error',
                        message: t.network_error(),
                    })
                }
            } finally {
                setLoading(false)
            }
        },
        [handleQueryAuthenticate, profileId, account, chainId, onSuccess, fetchJSON, showSingletonSnackbar, onFailed],
    )

    return { loading, handleFollow }
}
