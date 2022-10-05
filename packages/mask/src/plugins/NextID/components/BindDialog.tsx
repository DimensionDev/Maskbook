import { memo } from 'react'
import { useI18N } from '../locales/index.js'
import { useAsyncRetry } from 'react-use'
import { isSameAddress } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Binding, PersonaInformation } from '@masknet/shared-base'
import { NextIDAction, NextIDPlatform } from '@masknet/shared-base'
import { BindPanelUI } from './BindPanelUI.js'
import { useAccount } from '@masknet/web3-hooks-base'
import { useCustomSnackbar } from '@masknet/theme'
import { delay } from '@dimensiondev/kit'
import { useBindPayload } from '../hooks/useBindPayload.js'
import { usePersonaSign } from '../hooks/usePersonaSign.js'
import { useWalletSign } from '../hooks/useWalletSign.js'
import { NextIDProof } from '@masknet/web3-providers'
import { MaskMessages } from '../../../../shared/index.js'

interface BindDialogProps {
    open: boolean
    onClose(): void
    onBound(): void
    persona: PersonaInformation
    bounds: Binding[]
}

export const BindDialog = memo<BindDialogProps>(({ open, onClose, persona, onBound, bounds }) => {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const t = useI18N()
    const { showSnackbar } = useCustomSnackbar()
    const currentIdentifier = persona.identifier
    const isBound = !!bounds.find((x) => isSameAddress(x.identity, account))

    const { value: message } = useBindPayload(NextIDAction.Create, account, persona.identifier.publicKeyAsHex)
    const [personaSignState, handlePersonaSign] = usePersonaSign(message?.signPayload, currentIdentifier)
    const [walletSignState, handleWalletSign] = useWalletSign(message?.signPayload, account)

    useAsyncRetry(async () => {
        if (
            !personaSignState.value ||
            !walletSignState.value ||
            isBound ||
            !message ||
            !persona.identifier.publicKeyAsHex
        )
            return
        try {
            await NextIDProof.bindProof(
                message.uuid,
                persona.identifier.publicKeyAsHex,
                NextIDAction.Create,
                NextIDPlatform.Ethereum,
                account,
                message.createdAt,
                {
                    walletSignature: walletSignState.value,
                    signature: personaSignState.value.signature.signature,
                },
            )
            showSnackbar(t.notify_wallet_sign_request_title(), {
                variant: 'success',
                message: t.notify_wallet_sign_request_success(),
            })

            MaskMessages.events.ownProofChanged.sendToAll()

            await delay(2000)
            onBound()
            onClose()
        } catch {
            showSnackbar(t.notify_wallet_sign_request_title(), {
                variant: 'error',
                message: t.notify_wallet_sign_request_failed(),
            })
        }
    }, [walletSignState.value, personaSignState.value, isBound])

    return (
        <BindPanelUI
            title={t.verify_wallet_dialog_title()}
            onClose={onClose}
            open={open}
            currentPersona={persona}
            onPersonaSign={handlePersonaSign}
            onWalletSign={handleWalletSign}
            isCurrentAccount
            signature={{
                persona: {
                    value: personaSignState.value?.signature.signature,
                    loading: personaSignState.loading,
                },
                wallet: walletSignState,
            }}
            isBound={isBound}
        />
    )
})
