import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { memo } from 'react'
import { PluginPetMessages } from '../messages.js'
import AnimatePic from './Animate.js'
import { PetDialog } from './PetDialog.js'

export const PetsGlobalInjection = memo(function PetsGlobalInjection() {
    const { open, closeDialog } = useRemoteControlledDialog(PluginPetMessages.events.essayDialogUpdated, () => {})
    return (
        <>
            <AnimatePic />
            {open ? <PetDialog open onClose={closeDialog} /> : null}
        </>
    )
})
