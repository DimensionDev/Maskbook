import { memo } from 'react'
import { useI18N } from '../locales'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { isSameAddress, useAccount } from '@masknet/web3-shared-evm'
import type { Persona } from '../../../database'
import type { Binding } from '../types'
import { BindPanelUI } from './BindPanelUI'

interface VerifyWalletDialogProps {
    unbindAddress: string
    persona: Persona
    onUnBind(): void
    onClose(): void
    bounds: Binding[]
}

export const UnBindDialog = memo<VerifyWalletDialogProps>(({ unbindAddress, onClose, persona, onUnBind, bounds }) => {
    const account = useAccount()
    const t = useI18N()
    const currentIdentifier = persona.identifier
    const isBound = !!bounds.find((x) => isSameAddress(x.identity, unbindAddress))

    const { value: message } = useAsyncRetry(() => {
        if (!currentIdentifier || !unbindAddress) return Promise.resolve(null)
        return Services.Helper.createPersonaPayload(currentIdentifier, 'delete', unbindAddress, 'ethereum')
    }, [currentIdentifier, unbindAddress])

    const [personaSignState, handlePersonaSign] = useAsyncFn(async () => {
        if (!message || !currentIdentifier) return
        return Services.Identity.signWithPersona({
            method: 'eth',
            message: message,
            identifier: currentIdentifier.toText(),
        })
    }, [message, currentIdentifier, unbindAddress])

    const [walletSignState, handleWalletSign] = useAsyncFn(async () => {
        if (!unbindAddress || !message) return
        return Services.Ethereum.personalSign(message, unbindAddress)
    }, [personaSignState.value, unbindAddress, message])

    useAsyncRetry(async () => {
        if (!personaSignState.value && !walletSignState.value) return
        await Services.Helper.bindProof(
            currentIdentifier,
            'delete',
            'ethereum',
            account,
            walletSignState.value,
            personaSignState.value?.signature.signature,
        )
        onUnBind()
        onClose()
    }, [walletSignState.value, personaSignState.value])

    return (
        <BindPanelUI
            title={t.unbind_dialog_title()}
            onClose={onClose}
            open={!!unbindAddress}
            currentPersona={persona}
            onPersonaSign={handlePersonaSign}
            onWalletSign={handleWalletSign}
            action="delete"
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
