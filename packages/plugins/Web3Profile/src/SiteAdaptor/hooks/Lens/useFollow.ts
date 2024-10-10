import { useCallback, useRef, type MouseEvent, useState } from 'react'
import { cloneDeep } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useContract } from '@masknet/web3-hooks-evm'
import { EVMWeb3, Lens } from '@masknet/web3-providers'
import { ChainId, ContractTransaction, splitSignature, useLensConstants } from '@masknet/web3-shared-evm'
import LensHubABI from '@masknet/web3-contracts/abis/LensHub.json'
import type { LensHub } from '@masknet/web3-contracts/types/LensHub.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { BroadcastType, type FollowModuleTypedData } from '@masknet/web3-providers/types'
import { type SnackbarKey, useCustomSnackbar, type SnackbarMessage, type ShowSnackbarOptions } from '@masknet/theme'
import { useQueryAuthenticate } from './useQueryAuthenticate.js'
import { fetchJSON } from '@masknet/plugin-infra/dom/context'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export function useFollow(
    profileId?: string,
    currentProfileId?: string,
    followModule?: FollowModuleTypedData,
    signless?: boolean,
    onSuccess?: (event: MouseEvent<HTMLElement>) => void,
    onFailed?: () => void,
) {
    const { _ } = useLingui()
    const [loading, setLoading] = useState(false)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const handleQueryAuthenticate = useQueryAuthenticate(account, currentProfileId)
    const { LENS_HUB_PROXY_CONTRACT_ADDRESS } = useLensConstants(chainId)
    const lensHub = useContract<LensHub>(chainId, LENS_HUB_PROXY_CONTRACT_ADDRESS, LensHubABI as AbiItem[])

    const snackbarKeyRef = useRef<SnackbarKey>(undefined)
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

    const broadcastAction = useCallback(
        async (event: MouseEvent<HTMLElement>) => {
            if (!profileId || chainId !== ChainId.Polygon) return
            const token = await handleQueryAuthenticate()
            if (!token) return

            const typedData = await Lens.createFollowTypedData(profileId, { token, followModule })

            if (!typedData) return

            const signature = await EVMWeb3.signMessage(
                'typedData',
                JSON.stringify({
                    domain: typedData.typedData.domain,
                    primaryType: 'Follow',
                    message: typedData.typedData.value,
                    types: {
                        Follow: typedData.typedData.types.Follow,
                        EIP712Domain: [
                            { name: 'name', type: 'string' },
                            { name: 'version', type: 'string' },
                            { name: 'chainId', type: 'uint256' },
                            { name: 'verifyingContract', type: 'address' },
                        ],
                    },
                }),
                { chainId },
            )

            const { v, r, s } = splitSignature(signature)

            const {
                deadline,
                idsOfProfilesToFollow,
                followerProfileId,
                followTokenIds,
                // cspell:disable-next-line
                datas: data,
            } = typedData.typedData.value

            let hash: string | undefined

            try {
                const broadcast = await Lens.broadcast(typedData.id, signature, { token, fetcher: fetchJSON })
                if (broadcast?.__typename === BroadcastType.RelayError) throw new Error(broadcast.reason)
                else hash = broadcast?.txHash
            } catch {
                onFailed?.()
                const tx = await new ContractTransaction(lensHub).fillAll(
                    lensHub?.methods.followWithSig(followerProfileId, idsOfProfilesToFollow, followTokenIds, data, [
                        account,
                        v,
                        r,
                        s,
                        deadline,
                    ]),
                    {
                        from: account,
                    },
                )

                hash = await EVMWeb3.sendTransaction(tx)
            }

            if (!hash) return
            onSuccess?.(event)

            const receipt = await EVMWeb3.confirmTransaction(hash, {
                signal: AbortSignal.timeout(3 * 60 * 1000),
            })
            if (!receipt.status) throw new Error('Failed to Follow')
        },
        [handleQueryAuthenticate, profileId, account, chainId, onSuccess, fetchJSON, onFailed],
    )

    const handleFollow = useCallback<(event: MouseEvent<HTMLElement>) => Promise<void>>(
        async (event: MouseEvent<HTMLElement>) => {
            const cloneEvent = cloneDeep(event)

            try {
                setLoading(true)
                if (!profileId || chainId !== ChainId.Polygon) return
                const token = await handleQueryAuthenticate()
                if (!token) return

                if (signless && !followModule?.feeFollowModule) {
                    try {
                        const result = await Lens.follow(profileId, { token, followModule, fetcher: fetchJSON })
                        if (result?.__typename === BroadcastType.RelayError) throw new Error('Failed to follow')
                        else if (result?.txHash) {
                            setLoading(false)
                            onSuccess?.(cloneEvent)
                            const receipt = await EVMWeb3.confirmTransaction(result.txHash, {
                                signal: AbortSignal.timeout(3 * 60 * 1000),
                            })
                            if (!receipt.status) {
                                onFailed?.()
                                throw new Error('Failed to follow')
                            }
                        }
                    } catch (error) {
                        if (error instanceof Error)
                            showSingletonSnackbar(error.message, {
                                processing: false,
                                variant: 'error',
                            })
                        broadcastAction(cloneEvent)
                    }
                } else {
                    broadcastAction(cloneEvent)
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
                    showSingletonSnackbar(_(msg`Follow Lens handle`), {
                        processing: false,
                        variant: 'error',
                        message: _(msg`Network error, try again`),
                    })
                }
            } finally {
                setLoading(false)
            }
        },
        [
            signless,
            profileId,
            onSuccess,
            onFailed,
            handleQueryAuthenticate,
            broadcastAction,
            followModule,
            fetchJSON,
            chainId,
        ],
    )

    return { loading, handleFollow }
}
