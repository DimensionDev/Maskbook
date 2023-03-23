import { useCallback, useRef } from 'react'
import { useAsyncFn } from 'react-use'
import getUnixTime from 'date-fns/getUnixTime'
import { useLastRecognizedIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import {
    NetworkPluginID,
    type PersonaInformation,
    PopupRoutes,
    ProofType,
    SignType,
    type Wallet,
} from '@masknet/shared-base'
import { useChainContext, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import type { OwnerAPI } from '@masknet/web3-providers/types'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { type ShowSnackbarOptions, type SnackbarKey, type SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import type { ManagerAccount } from '../type.js'
import { useI18N } from '../locales/index.js'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginSmartPayMessages } from '../message.js'

export function useDeploy(
    signPersona?: PersonaInformation,
    signWallet?: Wallet,
    signAccount?: ManagerAccount,
    contractAccount?: OwnerAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM>,
    nonce?: number,
    onSuccess?: () => void,
) {
    const snackbarKeyRef = useRef<SnackbarKey>()
    const t = useI18N()

    const { TransactionWatcher } = useWeb3State()
    const { signWithPersona, hasPaymentPassword, openPopupWindow } = useSNSAdaptorContext()
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
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        providerType: ProviderType.MaskWallet,
        account: undefined,
        chainId,
    })

    const { closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent)

    return useAsyncFn(async () => {
        try {
            if (
                !chainId ||
                !lastRecognizedIdentity?.isOwner ||
                !lastRecognizedIdentity?.identifier?.userId ||
                !signAccount?.address ||
                !contractAccount ||
                (!signPersona && !signWallet)
            )
                return

            const hasPassword = await hasPaymentPassword()
            if (!hasPassword) return openPopupWindow(PopupRoutes.CreatePassword)

            if (contractAccount.funded && !contractAccount.deployed) {
                const hash = await connection?.deploy?.(signAccount.address, signAccount.identifier, {
                    chainId,
                })

                if (!hash) return

                const result = await connection?.confirmTransaction(hash, {
                    signal: AbortSignal.timeout(5 * 60 * 1000),
                })

                if (!result?.status) return

                onSuccess?.()

                return result?.transactionHash
            }
            const payload = JSON.stringify({
                twitterHandle: lastRecognizedIdentity.identifier.userId,
                ts: getUnixTime(new Date()),
                ownerAddress: signAccount.address,
                nonce,
            })

            let signature: string | undefined

            showSingletonSnackbar(t.create_smart_pay_wallet(), {
                message: t.waiting_for_user_signature(),
                processing: true,
                variant: 'default',
            })

            if (signPersona) {
                signature = await signWithPersona(SignType.Message, payload, signPersona.identifier)
            } else if (signWallet) {
                signature = await connection?.signMessage('message', payload, {
                    account: signWallet.address,
                    providerType: ProviderType.MaskWallet,
                })
            }
            const publicKey = signPersona ? signPersona.identifier.publicKeyAsHex : signWallet?.address
            if (!signature || !publicKey) return

            closeSnackbar()

            const hash = await connection?.fund?.(
                {
                    publicKey,
                    type: signPersona ? ProofType.Persona : ProofType.EOA,
                    signature,
                    payload,
                },
                {
                    chainId,
                },
            )
            if (!hash) throw new Error('Deploy Failed')

            const result = await connection?.confirmTransaction(hash, {
                signal: AbortSignal.timeout(5 * 60 * 1000),
            })

            if (!result?.status) return

            const deployHash = await connection?.deploy?.(signAccount.address, signAccount.identifier, {
                chainId,
            })

            if (!deployHash) return

            const deployResult = await connection?.confirmTransaction(deployHash, {
                signal: AbortSignal.timeout(5 * 60 * 1000),
            })

            if (!deployResult?.status) return

            onSuccess?.()

            return deployResult.transactionHash
        } catch (error) {
            if (error instanceof Error) {
                let message = ''
                switch (error.message) {
                    case 'Failed To Fund':
                        message = t.transaction_rejected()
                        break
                    case 'Persona Rejected':
                        message = t.user_cancelled_the_transaction()
                        break
                    case 'Timeout':
                        message = t.timeout()
                        break
                    default:
                        message = t.network_error()
                }

                showSingletonSnackbar(t.create_smart_pay_wallet(), {
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
        connection,
        signAccount,
        lastRecognizedIdentity,
        signWallet,
        signPersona,
        contractAccount,
        nonce,
        onSuccess,
        TransactionWatcher,
    ])
}
