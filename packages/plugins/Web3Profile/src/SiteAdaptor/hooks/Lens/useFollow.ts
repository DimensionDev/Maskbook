import { useCallback, useRef, type MouseEvent, useState } from 'react'
import { cloneDeep } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useContract } from '@masknet/web3-hooks-evm'
import { Lens, EVMWeb3 } from '@masknet/web3-providers'
import { ChainId, ContractTransaction, splitSignature, useLensConstants } from '@masknet/web3-shared-evm'
import LensHubABI from '@masknet/web3-contracts/abis/LensHub.json'
import type { LensHub } from '@masknet/web3-contracts/types/LensHub.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { BroadcastType, type FollowModuleTypedData } from '@masknet/web3-providers/types'
import { fetchJSON } from '@masknet/plugin-infra/dom/context'
import { type SnackbarKey, useCustomSnackbar, type SnackbarMessage, type ShowSnackbarOptions } from '@masknet/theme'
import { useQueryAuthenticate } from './useQueryAuthenticate.js'
import { useWeb3ProfileTrans } from '../../../locales/i18n_generated.js'

export function useFollow(
    profileId?: string,
    currentProfileId?: string,
    followModule?: FollowModuleTypedData,
    onSuccess?: (event: MouseEvent<HTMLElement>) => void,
    onFailed?: () => void,
) {
    const [loading, setLoading] = useState(false)
    const t = useWeb3ProfileTrans()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const handleQueryAuthenticate = useQueryAuthenticate(account, currentProfileId)
    const { LENS_HUB_PROXY_CONTRACT_ADDRESS } = useLensConstants(chainId)
    const lensHub = useContract<LensHub>(chainId, LENS_HUB_PROXY_CONTRACT_ADDRESS, LensHubABI as AbiItem[])

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

    const handleFollow = useCallback<(event: MouseEvent<HTMLElement>) => Promise<void>>(
        async (event: MouseEvent<HTMLElement>) => {
            const cloneEvent = cloneDeep(event)

            try {
                setLoading(true)
                if (!profileId || chainId !== ChainId.Matic) return
                const token = await handleQueryAuthenticate()
                if (!token) return

                setLoading(true)
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

                const { deadline, idsOfProfilesToFollow, followerProfileId, followTokenIds, datas } =
                    typedData.typedData.value

                let hash: string | undefined

                try {
                    const broadcast = await Lens.broadcast(typedData.id, signature, { token, fetcher: fetchJSON })
                    if (broadcast?.__typename === BroadcastType.RelayError) throw new Error(broadcast.reason)
                    else hash = broadcast?.txHash
                } catch {
                    onFailed?.()
                    const tx = await new ContractTransaction(lensHub).fillAll(
                        lensHub?.methods.followWithSig(
                            followerProfileId,
                            idsOfProfilesToFollow,
                            followTokenIds,
                            datas,
                            [account, v, r, s, deadline],
                        ),
                        {
                            from: account,
                        },
                    )

                    hash = await EVMWeb3.sendTransaction(tx)
                }

                if (!hash) return
                onSuccess?.(cloneEvent)
                setLoading(false)

                const receipt = await EVMWeb3.confirmTransaction(hash, {
                    signal: AbortSignal.timeout(3 * 60 * 1000),
                })
                if (!receipt.status) throw new Error('Failed to Follow')
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
        [handleQueryAuthenticate, profileId, account, chainId, onSuccess, showSingletonSnackbar, onFailed],
    )

    return { loading, handleFollow }
}
