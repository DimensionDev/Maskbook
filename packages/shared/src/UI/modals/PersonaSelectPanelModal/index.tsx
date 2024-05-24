import { useState } from 'react'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { PersonaSelectPanelDialog } from './PersonaSelectPanelDialog.js'
import type { PositionOption } from '../../components/PersonaSelectPanel/index.js'

export interface PersonaSelectPanelModalOpenProps {
    finishTarget?: string
    enableVerify?: boolean
    position?: PositionOption
}

export function PersonaSelectPanelModal({ ref }: SingletonModalProps<PersonaSelectPanelModalOpenProps>) {
    const [finishTarget, setFinishTarget] = useState<string>()
    const [position, setPosition] = useState<PositionOption>()
    const [enableVerify, setEnableVerify] = useState<boolean>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setFinishTarget(props.finishTarget)
            setPosition(props.position)
            setEnableVerify(props.enableVerify)
        },
    })

    if (!open) return null
    return (
        <PersonaSelectPanelDialog
            open
            onClose={() => dispatch?.close()}
            finishTarget={finishTarget}
            position={position}
            enableVerify={enableVerify}
        />
    )
}
