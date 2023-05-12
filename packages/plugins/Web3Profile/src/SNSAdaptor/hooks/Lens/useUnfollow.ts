import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useWeb3, useWeb3Connection } from '@masknet/web3-hooks-base'
import { Lens } from '@masknet/web3-providers'
import { ChainId, ContractTransaction, createContract, encodeTypedData, splitSignature } from '@masknet/web3-shared-evm'
import LensFollowNftABI from '@masknet/web3-contracts/abis/LensFollowNFT.json'
import type { LensFollowNFT } from '@masknet/web3-contracts/types/LensFollowNFT.js'
import { useQueryAuthenticate } from './useQueryAuthenticate.js'
import { type AbiItem } from 'web3-utils'
import { BroadcastType } from '@masknet/web3-providers/types'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { type SnackbarMessage, type ShowSnackbarOptions, type SnackbarKey, useCustomSnackbar } from '@masknet/theme'
import { useCallback, useRef, type MouseEvent, useState } from 'react'
import { useI18N } from '../../../locales/i18n_generated.js'
import { cloneDeep } from 'lodash-es'

export function useUnfollow(
    profileId?: string,
    onSuccess?: (event: MouseEvent<HTMLElement>) => void,
    onFailed?: () => void,
) {
    const [loading, setLoading] = useState(false)
    const t = useI18N()
    const connection = useWeb3Connection()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const handleQueryAuthenticate = useQueryAuthenticate(account)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
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

    const handleUnfollow = useCallback(
        async (event: MouseEvent<HTMLElement>) => {
            const cloneEvent = cloneDeep(event)
            try {
                setLoading(true)
                if (!profileId || !connection || chainId !== ChainId.Matic) return
                const token = await handleQueryAuthenticate()
                if (!token) return

                const typedData = await Lens.createUnfollowTypedData(profileId, { token })

                if (!typedData) return

                const signature = await connection.signMessage(
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
                const { tokenId, deadline } = typedData.typedData.value

                let hash: string | undefined
                try {
                    const broadcast = await Lens.broadcast(typedData.id, signature, { token, fetcher: fetchJSON })
                    if (broadcast?.__typename === BroadcastType.RelayError) throw new Error(broadcast.reason)
                    else hash = broadcast?.txHash
                } catch {
                    onFailed?.()
                    setLoading(true)
                    const followNFTContract = createContract<LensFollowNFT>(
                        web3,
                        typedData.typedData.domain.verifyingContract,
                        LensFollowNftABI as AbiItem[],
                    )
                    const tx = await new ContractTransaction(followNFTContract).fillAll(
                        followNFTContract?.methods.burnWithSig(tokenId, [v, r, s, deadline]),
                        { from: account },
                    )
                    hash = await connection.sendTransaction(tx)
                }

                onSuccess?.(cloneEvent)
                setLoading(false)
                if (!hash) return
                const result = await connection.confirmTransaction(hash, {
                    signal: AbortSignal.timeout(3 * 60 * 1000),
                })

                if (!result.status) return
            } catch (error) {
                if (
                    error instanceof Error &&
                    !error.message.includes('Transaction was rejected') &&
                    !error.message.includes('Signature canceled') &&
                    !error.message.includes('User rejected the request') &&
                    !error.message.includes('User rejected transaction')
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
        [
            handleQueryAuthenticate,
            chainId,
            profileId,
            web3,
            account,
            onSuccess,
            connection,
            fetchJSON,
            showSingletonSnackbar,
        ],
    )

    return { loading, handleUnfollow }
}
