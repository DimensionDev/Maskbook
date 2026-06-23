import { useRef, useCallback } from 'react'
import { useAsyncFn } from 'react-use'
import { useTheme } from '@mui/material'
import { AirdropV2Abi } from '@masknet/web3-contracts/types/AirdropV2.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useContract } from '@masknet/web3-hooks-evm'
import { useAirdropClaimersConstants, type ChainId, ProviderType, formatEtherToWei } from '@masknet/web3-shared-evm'
import { type SnackbarKey, useCustomSnackbar, type SnackbarMessage, type ShowSnackbarOptions } from '@masknet/theme'
import { toFixed } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { EVMContract, EVMWeb3 } from '@masknet/web3-providers'
import { PluginClaimMessage } from '../message.js'
import { Trans } from '@lingui/react/macro'
import type { Address, Hex } from 'viem'

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
    const airdropContract = useContract(chainId, CONTRACT_ADDRESS, AirdropV2Abi)

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
            const args = [
                BigInt(eventIndex),
                merkleProof as Hex[],
                account as Address,
                BigInt(formatEtherToWei(amount).toFixed(0)),
            ] as const
            const gas = await EVMContract.estimateContractGas(airdropContract, 'claim', args, {
                chainId,
                from: account,
            })
            const tx = EVMContract.createTransactionRequest(airdropContract, 'claim', args, {
                from: account,
                gas: toFixed(gas ?? 0),
                chainId,
            })
            if (!tx) return

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
