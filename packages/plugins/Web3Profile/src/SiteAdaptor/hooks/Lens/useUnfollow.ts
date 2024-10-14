import { fetchJSON } from '@masknet/plugin-infra/dom/context'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useCustomSnackbar, type ShowSnackbarOptions, type SnackbarKey, type SnackbarMessage } from '@masknet/theme'
import LensHubABI from '@masknet/web3-contracts/abis/LensHub.json' with { type: 'json' }
import type { LensHub } from '@masknet/web3-contracts/types/LensHub.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useContract } from '@masknet/web3-hooks-evm'
import { EVMWeb3, Lens } from '@masknet/web3-providers'
import { BroadcastType } from '@masknet/web3-providers/types'
import { ChainId, ContractTransaction, useLensConstants } from '@masknet/web3-shared-evm'
import { cloneDeep } from 'lodash-es'
import { useCallback, useRef, useState, type MouseEvent } from 'react'
import type { AbiItem } from 'web3-utils'
import { useQueryAuthenticate } from './useQueryAuthenticate.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export function useUnfollow(
    profileId?: string,
    currentProfileId?: string,
    signless?: boolean,
    onSuccess?: (event: MouseEvent<HTMLElement>) => void,
    onFailed?: () => void,
) {
    const { _ } = useLingui()
    const [loading, setLoading] = useState(false)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const handleQueryAuthenticate = useQueryAuthenticate(account, currentProfileId)

    const snackbarKeyRef = useRef<SnackbarKey>(undefined)
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()

    const { LENS_HUB_PROXY_CONTRACT_ADDRESS } = useLensConstants(chainId)
    const lensHub = useContract<LensHub>(chainId, LENS_HUB_PROXY_CONTRACT_ADDRESS, LensHubABI as AbiItem[])

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
        async (cloneEvent: MouseEvent<HTMLElement>) => {
            if (!profileId || chainId !== ChainId.Matic) return
            const token = await handleQueryAuthenticate()
            if (!token) return

            const typedData = await Lens.createUnfollowTypedData(profileId, { token })

            if (!typedData) return

            const signature = await EVMWeb3.signMessage(
                'typedData',
                JSON.stringify({
                    domain: typedData.typedData.domain,
                    primaryType: 'Unfollow',
                    message: typedData.typedData.value,
                    types: {
                        Unfollow: typedData.typedData.types.Unfollow,
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

            const { idsOfProfilesToUnfollow, unfollowerProfileId } = typedData.typedData.value

            let hash: string | undefined
            try {
                onSuccess?.(cloneEvent)
                setLoading(false)
                const broadcast = await Lens.broadcast(typedData.id, signature, { token, fetcher: fetchJSON })
                if (broadcast?.__typename === BroadcastType.RelayError) throw new Error(broadcast.reason)
                else hash = broadcast?.txHash
            } catch {
                onFailed?.()
                setLoading(true)

                const tx = await new ContractTransaction(lensHub).fillAll(
                    lensHub?.methods.unfollow(unfollowerProfileId, idsOfProfilesToUnfollow),
                    { from: account },
                )
                hash = await EVMWeb3.sendTransaction(tx, { chainId: ChainId.Matic })
                onSuccess?.(cloneEvent)
                setLoading(false)
            }

            if (!hash) return

            const receipt = await EVMWeb3.confirmTransaction(hash, {
                chainId: ChainId.Matic,
                signal: AbortSignal.timeout(3 * 60 * 1000),
            })
            if (!receipt.status) throw new Error('Failed to unfollow')
        },
        [handleQueryAuthenticate, chainId, profileId, account, onSuccess, lensHub, fetchJSON, onFailed],
    )

    const handleUnfollow = useCallback(
        async (event: MouseEvent<HTMLElement>) => {
            const cloneEvent = cloneDeep(event)
            try {
                setLoading(true)
                if (!profileId || chainId !== ChainId.Matic) return
                const token = await handleQueryAuthenticate()
                if (!token) return

                if (signless) {
                    try {
                        const result = await Lens.unfollow(profileId, { token, fetcher: fetchJSON })
                        if (result?.__typename === BroadcastType.RelayError) throw new Error('Failed to unfollow')
                        else if (result?.txHash) {
                            setLoading(false)
                            onSuccess?.(cloneEvent)
                            const receipt = await EVMWeb3.confirmTransaction(result.txHash, {
                                signal: AbortSignal.timeout(3 * 60 * 1000),
                            })
                            if (!receipt.status) {
                                onFailed?.()
                                throw new Error('Failed to unfollow')
                            }
                        }
                    } catch {
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
                    showSingletonSnackbar(_(msg`Unfollow lens handle`), {
                        processing: false,
                        variant: 'error',
                        message: _(msg`Network error, try again`),
                    })
                }
            } finally {
                setLoading(false)
            }
        },
        [handleQueryAuthenticate, chainId, profileId, onSuccess, onFailed, showSingletonSnackbar, fetchJSON],
    )

    return { loading, handleUnfollow }
}
