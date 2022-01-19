import { memo } from 'react'
import { useI18N } from '../locales'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { isSameAddress } from '@masknet/web3-shared-evm'
import type { Persona } from '../../../database'
import type { Binding } from '../types'
import { BindPanelUI } from './BindPanelUI'
import { useAccount } from '@masknet/plugin-infra'
import { useCustomSnackbar } from '@masknet/theme'
import { delay } from '@masknet/shared-base'
import { useBindPayload } from '../hooks/useBindPayload'
import { usePersonaSign } from '../hooks/usePersonaSign'
import { useWalletSign } from '../hooks/useWalletSign'

interface BindDialogProps {
    open: boolean
    onClose(): void
    onBind(): void
    persona: Persona
    bounds: Binding[]
}

export const BindDialog = memo<BindDialogProps>(({ open, onClose, persona, onBind, bounds }) => {
    const account = useAccount()
    const t = useI18N()
    const { showSnackbar } = useCustomSnackbar()
    const currentIdentifier = persona.identifier
    const isBound = !!bounds.find((x) => isSameAddress(x.identity, account))

    const { value: message } = useBindPayload('create', account, currentIdentifier)
    const [personaSignState, handlePersonaSign] = usePersonaSign(message, currentIdentifier)
    const [walletSignState, handleWalletSign] = useWalletSign(message, account)

    useAsyncRetry(async () => {
        if (!personaSignState.value || !walletSignState.value || isBound) return
        try {
            await Services.Helper.bindProof(
                currentIdentifier,
                'create',
                'ethereum',
                account,
                walletSignState.value,
                personaSignState.value.signature.signature,
            )
            showSnackbar(t.notify_wallet_sign_request_title(), {
                variant: 'success',
                message: t.notify_wallet_sign_request_success(),
            })
            await delay(2000)
            onBind()
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
            action="create"
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
