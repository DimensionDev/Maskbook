import { useAsyncFn } from 'react-use'
import { useLastRecognizedIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { NetworkPluginID, PersonaInformation, SignType } from '@masknet/shared-base'
import { useChainContext, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import { AbstractAccountAPI, FunderAPI } from '@masknet/web3-providers/types'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { ManagerAccount } from '../type.js'
import type { Wallet } from '@masknet/web3-shared-base'
import getUnixTime from 'date-fns/getUnixTime'
import { SmartPayFunder } from '@masknet/web3-providers'
import { ShowSnackbarOptions, SnackbarKey, SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import { useI18N } from '../locales/index.js'
import { Box, Link, Typography, useTheme } from '@mui/material'
import { useCallback, useRef } from 'react'
import { Icons } from '@masknet/icons'

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
    const { Wallet, Others } = useWeb3State()
    const { signWithPersona } = useSNSAdaptorContext()
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

        const payload = JSON.stringify({
            twitterHandler: lastRecognizedIdentity.identifier.userId,
            ts: getUnixTime(new Date()),
            ownerAddress: signAccount.address,
            nonce,
        })

        let signature: string | undefined

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

        showSingletonSnackbar(t.create_smart_pay_wallet(), {
            message: t.waiting_for_user_signature(),
            processing: true,
            variant: 'default',
        })

        try {
            const response = await SmartPayFunder.fund(chainId, {
                publicKey,
                type: signPersona ? FunderAPI.ProofType.Persona : FunderAPI.ProofType.EOA,
                signature,
                payload,
            })

            if (response.message) {
                await Wallet?.addWallet({
                    name: 'Smart Pay',
                    address: contractAccount.address,
                    hasDerivationPath: false,
                    hasStoredKeyInfo: false,
                    id: contractAccount.address,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                showSingletonSnackbar(t.create_smart_pay_wallet(), {
                    processing: false,
                    variant: 'default',
                    message: (
                        <Box display="flex" alignItems="center">
                            <Typography sx={{ color: theme.palette.maskColor.success }}>
                                {t.transaction_submitted()}
                            </Typography>
                            <Link
                                href={Others?.explorerResolver.addressLink(chainId, response.message.tx)}
                                target="_blank"
                                rel="noopener">
                                <Icons.LinkOut />
                            </Link>
                        </Box>
                    ),
                })
            }
        } catch {
            showSingletonSnackbar(t.create_smart_pay_wallet(), {
                processing: false,
                variant: 'default',
                message: (
                    <Typography sx={{ color: theme.palette.maskColor.danger }}>
                        {t.user_cancelled_the_transaction()}
                    </Typography>
                ),
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
    ])
}
