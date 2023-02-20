import { useCallback, useRef } from 'react'
import { useAsyncFn } from 'react-use'
import getUnixTime from 'date-fns/getUnixTime'
import { useLastRecognizedIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { NetworkPluginID, PersonaInformation, PopupRoutes, ProofType, SignType } from '@masknet/shared-base'
import { useChainContext, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import type { OwnerAPI } from '@masknet/web3-providers/types'
import { ProviderType } from '@masknet/web3-shared-evm'
import { TransactionStatusType, Wallet } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { ShowSnackbarOptions, SnackbarKey, SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import type { ManagerAccount } from '../type.js'
import { useI18N } from '../locales/index.js'
import { timeout } from '@masknet/kit'
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

    const { Wallet, TransactionWatcher } = useWeb3State()
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

                const result = await timeout(
                    new Promise((resolve) => {
                        return TransactionWatcher?.emitter.on('progress', async (_, txHash, status) => {
                            if (txHash !== hash || status !== TransactionStatusType.SUCCEED) return
                            await Wallet?.addWallet({
                                name: 'Smart Pay',
                                owner: signAccount.address,
                                address: contractAccount.address,
                                hasDerivationPath: false,
                                hasStoredKeyInfo: false,
                                id: contractAccount.address,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            })
                            onSuccess?.()
                            resolve(hash)
                        })
                    }),
                    120 * 1000,
                    'Timeout',
                )

                return result
            }
            const payload = JSON.stringify({
                twitterHandler: lastRecognizedIdentity.identifier.userId,
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

            const result = timeout(
                new Promise((resolve) => {
                    return TransactionWatcher?.emitter.on('progress', async (_, txHash, status) => {
                        if (txHash !== hash || !signAccount.address || status !== TransactionStatusType.SUCCEED) return

                        const deployResult = await connection?.deploy?.(signAccount.address, signAccount.identifier, {
                            chainId,
                        })

                        TransactionWatcher?.emitter.on('progress', async (_, deployHash, deployStatus) => {
                            if (deployHash !== deployResult || deployStatus !== TransactionStatusType.SUCCEED) return

                            await Wallet?.addWallet({
                                name: 'Smart Pay',
                                owner: signAccount.address,
                                address: contractAccount.address,
                                hasDerivationPath: false,
                                hasStoredKeyInfo: false,
                                id: contractAccount.address,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            })

                            onSuccess?.()

                            resolve(deployResult)
                        })
                    })
                }),
                120 * 1000,
                'Timeout',
            )

            return result
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
        lastRecognizedIdentity?.identifier,
        signWallet,
        signPersona,
        contractAccount,
        nonce,
        onSuccess,
        TransactionWatcher,
        Wallet,
    ])
}
