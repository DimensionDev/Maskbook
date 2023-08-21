import { useCallback, useRef, type MouseEvent, useState } from 'react'
import { cloneDeep } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Contract, Lens, Web3 } from '@masknet/web3-providers'
import { type SnackbarMessage, type ShowSnackbarOptions, type SnackbarKey, useCustomSnackbar } from '@masknet/theme'
import { ChainId, ContractTransaction, encodeTypedData, splitSignature } from '@masknet/web3-shared-evm'
import LensFollowNftABI from '@masknet/web3-contracts/abis/LensFollowNFT.json'
import type { LensFollowNFT } from '@masknet/web3-contracts/types/LensFollowNFT.js'
import { useQueryAuthenticate } from './useQueryAuthenticate.js'
import { BroadcastType } from '@masknet/web3-providers/types'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'
import { useI18N } from '../../../locales/i18n_generated.js'

export function useUnfollow(
    profileId?: string,
    onSuccess?: (event: MouseEvent<HTMLElement>) => void,
    onFailed?: () => void,
) {
    const [loading, setLoading] = useState(false)
    const t = useI18N()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const handleQueryAuthenticate = useQueryAuthenticate(account)
    const { fetchJSON } = useSiteAdaptorContext()

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

    const handleUnfollow = useCallback(
        async (event: MouseEvent<HTMLElement>) => {
            const cloneEvent = cloneDeep(event)
            try {
                setLoading(true)
                if (!profileId || chainId !== ChainId.Matic) return
                const token = await handleQueryAuthenticate()
                if (!token) return

                const typedData = await Lens.createUnfollowTypedData(profileId, { token })

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
                    { chainId: ChainId.Matic },
                )

                const { v, r, s } = splitSignature(signature)
                const { tokenId, deadline } = typedData.typedData.value

                let hash: string | undefined
                try {
                    onSuccess?.(cloneEvent)
                    setLoading?.(false)
                    const broadcast = await Lens.broadcast(typedData.id, signature, { token, fetcher: fetchJSON })
                    if (broadcast?.__typename === BroadcastType.RelayError) throw new Error(broadcast.reason)
                    else hash = broadcast?.txHash
                } catch {
                    onFailed?.()
                    setLoading(true)

                    const followNFTContract = Contract.getWeb3Contract<LensFollowNFT>(
                        typedData.typedData.domain.verifyingContract,
                        LensFollowNftABI as AbiItem[],
                    )
                    const tx = await new ContractTransaction(followNFTContract).fillAll(
                        followNFTContract?.methods.burnWithSig(tokenId, [v, r, s, deadline]),
                        { from: account },
                    )
                    hash = await Web3.sendTransaction(tx, { chainId: ChainId.Matic })
                    onSuccess?.(cloneEvent)
                    setLoading(false)
                }

                if (!hash) return

                const receipt = await Web3.confirmTransaction(hash, {
                    chainId: ChainId.Matic,
                    signal: AbortSignal.timeout(3 * 60 * 1000),
                })
                if (!receipt.status) return
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
                    showSingletonSnackbar(t.unfollow_lens_handle(), {
                        processing: false,
                        variant: 'error',
                        message: t.network_error(),
                    })
                }
            } finally {
                setLoading(false)
            }
        },
        [handleQueryAuthenticate, chainId, profileId, account, onSuccess, fetchJSON, showSingletonSnackbar],
    )

    return { loading, handleUnfollow }
}
