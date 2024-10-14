import { useRef, useCallback } from 'react'
import { useAsyncFn } from 'react-use'
import type { AbiItem } from 'web3-utils'
import { useTheme } from '@mui/material'
import type { AirdropV2 } from '@masknet/web3-contracts/types/AirdropV2.js'
import AirDropV2ABI from '@masknet/web3-contracts/abis/AirdropV2.json' with { type: 'json' }
import { useChainContext } from '@masknet/web3-hooks-base'
import { useContract } from '@masknet/web3-hooks-evm'
import {
    useAirdropClaimersConstants,
    type ChainId,
    ProviderType,
    ContractTransaction,
    formatEtherToWei,
} from '@masknet/web3-shared-evm'
import { type SnackbarKey, useCustomSnackbar, type SnackbarMessage, type ShowSnackbarOptions } from '@masknet/theme'
import { toFixed } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { EVMWeb3 } from '@masknet/web3-providers'
import { PluginClaimMessage } from '../message.js'
import { Trans } from '@lingui/macro'

export function useClaimAirdrop(
    chainId: ChainId,
    eventIndex: number,
    callback: () => void,
    merkleProof?: string[],
    amount?: string,
    tokenAddress?: string,
) {
    const theme = useTheme()
    const { account, providerType, chainId: globalChainId } = useChainContext()
    const { CONTRACT_ADDRESS } = useAirdropClaimersConstants(chainId)
    const airdropContract = useContract<AirdropV2>(chainId, CONTRACT_ADDRESS, AirDropV2ABI as AbiItem[])

    const { setDialog } = useRemoteControlledDialog(PluginClaimMessage.claimSuccessDialogEvent)

    const { showSnackbar, closeSnackbar } = useCustomSnackbar()

    const snackbarKeyRef = useRef<SnackbarKey>(undefined)
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

    return useAsyncFn(async () => {
        try {
            if (!airdropContract || !amount || !merkleProof) return

            if (chainId !== globalChainId && providerType === ProviderType.WalletConnect) {
                await EVMWeb3.switchChain?.(chainId, {
                    providerType: ProviderType.WalletConnect,
                })
            }
            const tx = await new ContractTransaction(airdropContract).fillAll(
                airdropContract.methods.claim(eventIndex, merkleProof, account, formatEtherToWei(amount)),
                {
                    from: account,
                    gas: toFixed(
                        await airdropContract.methods
                            .claim(eventIndex, merkleProof, account, formatEtherToWei(amount))
                            .estimateGas({ from: account }),
                    ),
                    chainId,
                },
            )

            const hash = await EVMWeb3.sendTransaction(tx, {
                chainId,
            })
            const receipt = await EVMWeb3.getTransactionReceipt(hash, {
                chainId,
            })

            if (receipt) {
                callback()
                setDialog({
                    open: true,
                    token: tokenAddress,
                    amount,
                })
            }
        } catch (error) {
            if (
                error instanceof Error &&
                (error.message.includes('Transaction was rejected') ||
                    error.message.includes('Signature canceled') ||
                    error.message.includes('User rejected the request') ||
                    error.message.includes('User rejected transaction'))
            )
                showSingletonSnackbar(<Trans>Claim your Airdrop</Trans>, {
                    processing: false,
                    variant: 'default',
                    message: (
                        <span style={{ color: theme.palette.maskColor.danger }}>
                            <Trans>Your wallet cancelled the transaction.</Trans>
                        </span>
                    ),
                })
        }
    }, [airdropContract, account, amount, merkleProof, eventIndex, providerType, globalChainId])
}
