import { useCallback, useRef } from 'react'
import { useAsyncFn } from 'react-use'
import getUnixTime from 'date-fns/getUnixTime'
import { useLastRecognizedIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { NetworkPluginID, PersonaInformation, PopupRoutes, ProofType, SignType } from '@masknet/shared-base'
import { useChainContext, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import type { AbstractAccountAPI } from '@masknet/web3-providers/types'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { Wallet } from '@masknet/web3-shared-base'
import { Typography, useTheme } from '@mui/material'
import { ShowSnackbarOptions, SnackbarKey, SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import type { ManagerAccount } from '../type.js'
import { useI18N } from '../locales/index.js'

export function useDeploy(
    signPersona?: PersonaInformation,
    signWallet?: Wallet,
    signAccount?: ManagerAccount,
    contractAccount?: AbstractAccountAPI.AbstractAccount<NetworkPluginID.PLUGIN_EVM>,
    nonce?: number,
    onSuccess?: () => void,
) {
    const theme = useTheme()
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
        chainId,
    })

    return useAsyncFn(async () => {
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
            signature = await connection?.signMessage(payload, 'personalSign', {
                account: signWallet.address,
                providerType: ProviderType.MaskWallet,
            })
        }
        const publicKey = signPersona ? signPersona.identifier.publicKeyAsHex : signWallet?.address
        if (!signature || !publicKey) return

        closeSnackbar()

        try {
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

            return TransactionWatcher?.emitter.on('progress', (chainId, txHash, status) => {
                if (txHash !== hash) return
                Wallet?.addWallet({
                    name: 'Smart Pay',
                    address: contractAccount.address,
                    hasDerivationPath: false,
                    hasStoredKeyInfo: false,
                    id: contractAccount.address,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }).then(onSuccess)
            })
        } catch (error) {
            showSingletonSnackbar(t.create_smart_pay_wallet(), {
                processing: false,
                variant: 'error',
                message: <Typography>{t.user_cancelled_the_transaction()}</Typography>,
            })
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
    ])
}
