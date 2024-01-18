import { memo } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginPetMessages } from '../messages.js'
import AnimatePic from './Animate.js'
import { PetDialog } from './PetDialog.js'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { PetsPluginID } from '../constants.js'

export const PetsGlobalInjection = memo(function PetsGlobalInjection() {
    const { open, closeDialog } = useRemoteControlledDialog(PluginPetMessages.essayDialogUpdated)
    const isMinimalMode = useIsMinimalMode(PetsPluginID)
    if (isMinimalMode) return false
    return (
        <>
            <AnimatePic />
            {open ?
                <PetDialog open onClose={closeDialog} />
            :   null}
        </>
    )
})
