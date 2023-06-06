import { memo, useCallback, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { delay } from '@masknet/kit'
import { useCustomSnackbar } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import {
    type NetworkPluginID,
    type Binding,
    type PersonaInformation,
    NextIDAction,
    NextIDPlatform,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { usePersonaSign } from '../hooks/usePersonaSign.js'
import { useWalletSign } from '../hooks/useWalletSign.js'
import { useBindPayload } from '../hooks/useBindPayload.js'
import { UnbindPanelUI } from './UnbindPanelUI.js'
import { UnbindConfirm } from './UnbindConfirm.js'
import { MaskMessages } from '../../../../shared/index.js'
import { useI18N } from '../locales/index.js'

interface VerifyWalletDialogProps {
    unbindAddress: string
    persona: PersonaInformation
    onUnBound(): void
    onClose(): void
    bounds: Binding[]
}

export const UnbindDialog = memo<VerifyWalletDialogProps>(({ unbindAddress, onClose, persona, onUnBound, bounds }) => {
    const t = useI18N()

    const { showSnackbar } = useCustomSnackbar()
    const [openSecondDialog, setSecondDialog] = useState(false)
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isBound = !!bounds.find((x) => isSameAddress(x.identity, unbindAddress))

    const { value: message } = useBindPayload(NextIDAction.Delete, unbindAddress, persona.identifier.publicKeyAsHex)
    const [personaSignState, handlePersonaSign] = usePersonaSign(message?.signPayload, persona.identifier)
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
                    walletSignature: walletSignState.value,
                    signature: personaSignState.value,
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
                    persona: personaSignState,
                    wallet: walletSignState,
                }}
                isBound={isBound}
            />
        </>
    )
})
