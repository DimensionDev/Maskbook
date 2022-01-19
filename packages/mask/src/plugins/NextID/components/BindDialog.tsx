import { memo } from 'react'
import { useI18N } from '../locales'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { isSameAddress } from '@masknet/web3-shared-evm'
import type { Persona } from '../../../database'
import type { Binding } from '../types'
import { BindPanelUI } from './BindPanelUI'
import { useAccount } from '@masknet/plugin-infra'

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
    const currentIdentifier = persona.identifier
    const isBound = !!bounds.find((x) => isSameAddress(x.identity, account))

    const { value: message } = useAsyncRetry(() => {
        if (!currentIdentifier || !account) return Promise.resolve(null)
        return Services.Helper.createPersonaPayload(currentIdentifier, 'create', account, 'ethereum')
    }, [currentIdentifier])

    const [personaSignState, handlePersonaSign] = useAsyncFn(async () => {
        if (!message || !currentIdentifier || isBound) return
        return Services.Identity.signWithPersona({
            method: 'eth',
            message: message,
            identifier: currentIdentifier.toText(),
        })
    }, [message, currentIdentifier, account, isBound])

    const [walletSignState, handleWalletSign] = useAsyncFn(async () => {
        if (!account || !message || isBound) return
        return Services.Ethereum.personalSign(message, account)
    }, [personaSignState.value, account, message, isBound])

    useAsyncRetry(async () => {
        if (!personaSignState.value || !walletSignState.value || isBound) return
        await Services.Helper.bindProof(
            currentIdentifier,
            'create',
            'ethereum',
            account,
            walletSignState.value,
            personaSignState.value.signature.signature,
        )
        onBind()
        onClose()
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
