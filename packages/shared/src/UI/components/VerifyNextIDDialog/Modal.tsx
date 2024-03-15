import type { PersonaInformation, SingletonModalRefCreator } from '@masknet/shared-base'
import { forwardRef, useState } from 'react'
import { VerifyNextIDDialog, type VerifyNextIDDialogCloseProps, type VerifyNextIDDialogProps } from './index.js'
import { useSingletonModal } from '@masknet/shared-base-ui'

export const VerifyNextIDModal = forwardRef<
    SingletonModalRefCreator<VerifyNextIDDialogProps, VerifyNextIDDialogCloseProps>
>(function VerifyNextIDModal(props, ref) {
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
})
