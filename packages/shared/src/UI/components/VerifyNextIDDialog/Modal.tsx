import type { PersonaInformation, SingletonModalProps } from '@masknet/shared-base'
import { useState } from 'react'
import { VerifyNextIDDialog, type VerifyNextIDDialogCloseProps, type VerifyNextIDDialogProps } from './index.js'
import { useSingletonModal } from '@masknet/shared-base-ui'

export function VerifyNextIDModal({ ref }: SingletonModalProps<VerifyNextIDDialogProps, VerifyNextIDDialogCloseProps>) {
    const [personaInfo, setPersonaInfo] = useState<PersonaInformation>()
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setPersonaInfo(props.personaInfo)
        },
    })
    if (!open || !personaInfo) return null
    return (
        <VerifyNextIDDialog
            personaInfo={personaInfo}
            onClose={() => dispatch?.close({ aborted: true })}
            onSentPost={(res) => {
                if (!dispatch || !res) return
                dispatch.close(res)
            }}
        />
    )
}
