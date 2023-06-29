import { forwardRef, useState } from 'react'
import type { PersonaInformation, ProfileIdentifier, SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { DisconnectDialog } from './DisconnectDialog.js'

export interface DisconnectModalOpenProps {
    unbundledIdentity: ProfileIdentifier
    onSubmit: () => Promise<void>
    currentPersona: PersonaInformation
}

export interface DisconnectModalProps {}

export const DisconnectModal = forwardRef<SingletonModalRefCreator<DisconnectModalOpenProps>, DisconnectModalProps>(
    (props, ref) => {
        const [unbundledIdentity, setUnbundledIdentity] = useState<ProfileIdentifier>()
        const [onSubmit, setOnSubmit] = useState<() => Promise<void>>()
        const [currentPersona, setCurrentPersona] = useState<PersonaInformation>()
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setUnbundledIdentity(props.unbundledIdentity)
                setOnSubmit(() => props.onSubmit)
                setCurrentPersona(props.currentPersona)
            },
        })

        return (
            <DisconnectDialog
                unbundledIdentity={unbundledIdentity}
                open={open}
                onClose={() => dispatch?.close()}
                onSubmit={onSubmit}
                currentPersona={currentPersona}
            />
        )
    },
)
