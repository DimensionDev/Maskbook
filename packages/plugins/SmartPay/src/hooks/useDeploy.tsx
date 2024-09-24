import { useCallback, useRef } from 'react'
import { useAsyncFn } from 'react-use'
import { getUnixTime } from 'date-fns'
import { Typography } from '@mui/material'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import {
    type NetworkPluginID,
    type PersonaInformation,
    PopupRoutes,
    ProofType,
    SignType,
    type Wallet,
} from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import type { OwnerAPI } from '@masknet/web3-providers/types'
import { ProviderType } from '@masknet/web3-shared-evm'
import { type ShowSnackbarOptions, type SnackbarKey, type SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import { EVMWeb3 } from '@masknet/web3-providers'
import type { ManagerAccount } from '../type.js'
import { PluginSmartPayMessages } from '../message.js'
import { openPopupWindow, signWithPersona, hasPaymentPassword } from '@masknet/plugin-infra/dom/context'
import { Trans } from '@lingui/macro'

export function useDeploy(
    signPersona?: PersonaInformation,
    signWallet?: Wallet,
    signAccount?: ManagerAccount,
    contractAccount?: OwnerAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM>,
    nonce?: number,
    onSuccess?: () => void,
) {
    const snackbarKeyRef = useRef<SnackbarKey>(undefined)

    const { TransactionWatcher, Transaction } = useWeb3State()
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

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

    const { closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent)

    return useAsyncFn(async () => {
        try {
            const options = {
                account: undefined,
                chainId,
                providerType: ProviderType.MaskWallet,
                signal: AbortSignal.timeout(5 * 60 * 1000),
            }
            if (
                !chainId ||
                !lastRecognizedIdentity?.isOwner ||
                !lastRecognizedIdentity.identifier?.userId ||
                !signAccount?.address ||
                !contractAccount ||
                (!signPersona && !signWallet)
            )
                return

            const hasPassword = await hasPaymentPassword()
            if (!hasPassword) return await openPopupWindow(PopupRoutes.SetPaymentPassword, {})

            if (contractAccount.funded && !contractAccount.deployed) {
                const hash = await EVMWeb3.deploy?.(signAccount.address, signAccount.identifier, options)

                if (!hash) return

                const result = await EVMWeb3.confirmTransaction(hash, options)

                if (!result?.status) return

                onSuccess?.()

                return result.transactionHash
            }
            const payload = JSON.stringify({
                twitterHandle: lastRecognizedIdentity.identifier.userId,
                ts: getUnixTime(new Date()),
                ownerAddress: signAccount.address,
                nonce,
            })

            let signature: string | undefined

            showSingletonSnackbar(<Trans>Create SmartPay Wallet</Trans>, {
                message: <Trans>Waiting for user signature</Trans>,
                processing: true,
                variant: 'default',
            })

            if (signPersona) {
                signature = await signWithPersona(SignType.Message, payload, signPersona.identifier)
            } else if (signWallet) {
                signature = await EVMWeb3.signMessage('message', payload, options)
            }
            const publicKey = signPersona ? signPersona.identifier.publicKeyAsHex : signWallet?.address
            if (!signature || !publicKey) return

            closeSnackbar()

            const hash = await EVMWeb3.fund?.(
                {
                    publicKey,
                    type: signPersona ? ProofType.Persona : ProofType.EOA,
                    signature,
                    payload,
                },
                options,
            )
            if (!hash) throw new Error('Deploy Failed')

            const result = await EVMWeb3.confirmTransaction(hash, options)
            if (!result?.status) return

            const deployHash = await EVMWeb3.deploy?.(signAccount.address, signAccount.identifier, options)
            if (!deployHash) return

            const deployResult = await EVMWeb3.confirmTransaction(deployHash, options)
            if (!deployResult?.status) return
            await Transaction?.removeTransaction?.(chainId, '', hash)
            await Transaction?.removeTransaction?.(chainId, '', deployHash)
            onSuccess?.()

            return deployResult.transactionHash
        } catch (error) {
            if (error instanceof Error) {
                let message
                switch (error.message) {
                    case 'Failed To Fund':
                        message = <Trans>Transaction rejected.</Trans>
                        break
                    case 'Persona Rejected':
                        message = <Trans>User cancelled the process.</Trans>
                        break
                    case 'Timeout':
                        message = <Trans>Timeout</Trans>
                        break
                    default:
                        message = <Trans>Network error.</Trans>
                }

                showSingletonSnackbar(<Trans>Create SmartPay Wallet</Trans>, {
                    processing: false,
                    variant: 'error',
                    message: <Typography>{message}</Typography>,
                })

                if (error.message === 'Timeout') {
                    closeDialog()
                }
            }
        }
    }, [
        chainId,
        signAccount,
        lastRecognizedIdentity,
        signWallet,
        signPersona,
        contractAccount,
        nonce,
        onSuccess,
        TransactionWatcher,
        Transaction,
    ])
}
