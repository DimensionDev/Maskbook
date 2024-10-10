import { memo } from 'react'
import { useAsyncRetry } from 'react-use'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    type NetworkPluginID,
    type Binding,
    type PersonaInformation,
    NextIDAction,
    NextIDPlatform,
    MaskMessages,
} from '@masknet/shared-base'
import { delay } from '@masknet/kit'
import { useChainContext } from '@masknet/web3-hooks-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useCustomSnackbar } from '@masknet/theme'
import { BindPanelUI } from './BindPanelUI.js'
import { useBindPayload } from '../hooks/useBindPayload.js'
import { usePersonaSign } from '../hooks/usePersonaSign.js'
import { useWalletSign } from '../hooks/useWalletSign.js'
import { Trans } from '@lingui/macro'

interface BindDialogProps {
    open: boolean
    onClose(): void
    onBound(): void
    persona: PersonaInformation
    bounds: Binding[]
}

export const BindDialog = memo<BindDialogProps>(({ open, onClose, persona, onBound, bounds }) => {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
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
                    signature: personaSignState.value,
                },
            )
            showSnackbar(<Trans>Wallet Sign</Trans>, {
                variant: 'success',
                message: <Trans>Wallet sign succeeded.</Trans>,
            })

            MaskMessages.events.ownProofChanged.sendToAll()

            await delay(2000)
            onBound()
            onClose()
        } catch {
            showSnackbar(<Trans>Wallet Sign</Trans>, {
                variant: 'error',
                message: <Trans>Wallet sign failed.</Trans>,
            })
        }
    }, [walletSignState.value, personaSignState.value, isBound])

    return (
        <BindPanelUI
            title={<Trans>Verify your wallet</Trans>}
            onClose={onClose}
            open={open}
            currentPersona={persona}
            onPersonaSign={handlePersonaSign}
            onWalletSign={handleWalletSign}
            isCurrentAccount
            signature={{
                persona: personaSignState,
                wallet: walletSignState,
            }}
            isBound={isBound}
        />
    )
})
