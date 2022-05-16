import { memo, useCallback, useState } from 'react'
import { useI18N } from '../locales'
import { useAsyncRetry } from 'react-use'
<<<<<<< HEAD
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount } from '@masknet/plugin-infra/web3'
import { Binding, NextIDAction, NextIDPlatform } from '@masknet/shared-base'
=======
import { isSameAddress, useAccount } from '@masknet/web3-shared-evm'
import type { Binding, PersonaInformation } from '@masknet/shared-base'
import { NextIDAction, NextIDPlatform } from '@masknet/shared-base'
>>>>>>> develop
import { useCustomSnackbar } from '@masknet/theme'
import { delay } from '@dimensiondev/kit'
import { NextIDProof } from '@masknet/web3-providers'
import type { Persona } from '../../../database'
import { usePersonaSign } from '../hooks/usePersonaSign'
import { useWalletSign } from '../hooks/useWalletSign'
import { useBindPayload } from '../hooks/useBindPayload'
import { UnbindPanelUI } from './UnbindPanelUI'
import { UnbindConfirm } from './UnbindConfirm'
import { MaskMessages } from '../../../../shared'

interface VerifyWalletDialogProps {
    unbindAddress: string
    persona: PersonaInformation
    onUnBound(): void
    onClose(): void
    bounds: Binding[]
}

export const UnbindDialog = memo<VerifyWalletDialogProps>(({ unbindAddress, onClose, persona, onUnBound, bounds }) => {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const t = useI18N()

    const [openSecondDialog, setSecondDialog] = useState(false)

    const { showSnackbar } = useCustomSnackbar()
    const currentIdentifier = persona.identifier
    const isBound = !!bounds.find((x) => isSameAddress(x.identity, unbindAddress))

    const { value: message } = useBindPayload(NextIDAction.Delete, unbindAddress, persona.identifier.publicKeyAsHex)
    const [personaSignState, handlePersonaSign] = usePersonaSign(message?.signPayload, currentIdentifier)
    const [walletSignState, handleWalletSign] = useWalletSign(message?.signPayload, unbindAddress)

    useAsyncRetry(async () => {
        if (!personaSignState.value && !walletSignState.value) return
        if (!message || !persona.identifier.publicKeyAsHex) return
        try {
            await NextIDProof.bindProof(
                message.uuid,
                persona.identifier.publicKeyAsHex,
                NextIDAction.Delete,
                NextIDPlatform.Ethereum,
                unbindAddress,
                message.createdAt,
                {
                    walletSignature: walletSignState?.value,
                    signature: personaSignState?.value?.signature.signature,
                },
            )
            showSnackbar(t.notify_wallet_sign_request_title(), {
                variant: 'success',
                message: t.notify_wallet_sign_request_success(),
            })

            MaskMessages.events.ownProofChanged.sendToAll()

            await delay(2000)
            onUnBound()
            onClose()
        } catch {
            showSnackbar(t.notify_wallet_sign_request_title(), {
                variant: 'error',
                message: t.notify_wallet_sign_request_failed(),
            })
        }
    }, [walletSignState.value, personaSignState.value, unbindAddress])

    const handleConfirm = useCallback(() => setSecondDialog(true), [])

    return (
        <>
            <UnbindConfirm unbindAddress={unbindAddress} onConfirm={handleConfirm} onClose={onClose} />
            <UnbindPanelUI
                title={t.unbind_dialog_title()}
                onClose={onClose}
                open={!!unbindAddress && openSecondDialog}
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
        </>
    )
})
