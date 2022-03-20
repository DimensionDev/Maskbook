import { memo } from 'react'
import { useI18N } from '../locales'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { isSameAddress, useAccount } from '@masknet/web3-shared-evm'
import type { Persona } from '../../../database'
import type { Binding } from '../types'
import { useCustomSnackbar } from '@masknet/theme'
import { usePersonaSign } from '../hooks/usePersonaSign'
import { useWalletSign } from '../hooks/useWalletSign'
import { useBindPayload } from '../hooks/useBindPayload'
import { delay } from '@dimensiondev/kit'
import { UnbindPanelUI } from './UnbindPanelUI'

interface VerifyWalletDialogProps {
    unbindAddress: string
    persona: Persona
    onUnBind(): void
    onClose(): void
    bounds: Binding[]
}

export const UnbindDialog = memo<VerifyWalletDialogProps>(({ unbindAddress, onClose, persona, onUnBind, bounds }) => {
    const account = useAccount()
    const t = useI18N()
    const { showSnackbar } = useCustomSnackbar()
    const currentIdentifier = persona.identifier
    const isBound = !!bounds.find((x) => isSameAddress(x.identity, unbindAddress))

    const { value: message } = useBindPayload('delete', unbindAddress, currentIdentifier)
    const [personaSignState, handlePersonaSign] = usePersonaSign(message, currentIdentifier)
    const [walletSignState, handleWalletSign] = useWalletSign(message, unbindAddress)

    useAsyncRetry(async () => {
        if (!personaSignState.value && !walletSignState.value) return
        try {
            await Services.Helper.bindProof(
                currentIdentifier,
                'delete',
                'ethereum',
                unbindAddress,
                walletSignState.value,
                personaSignState.value?.signature.signature,
            )
            showSnackbar(t.notify_wallet_sign_request_title(), {
                variant: 'success',
                message: t.notify_wallet_sign_request_success(),
            })
            await delay(2000)
            onUnBind()
            onClose()
        } catch {
            showSnackbar(t.notify_wallet_sign_request_title(), {
                variant: 'error',
                message: t.notify_wallet_sign_request_failed(),
            })
        }
    }, [walletSignState.value, personaSignState.value, unbindAddress])

    return (
        <UnbindPanelUI
            title={t.unbind_dialog_title()}
            onClose={onClose}
            open={!!unbindAddress}
            currentPersona={persona}
            onPersonaSign={handlePersonaSign}
            onWalletSign={handleWalletSign}
            isCurrentAccount={isSameAddress(account, unbindAddress)}
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
