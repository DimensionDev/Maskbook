import { SingletonModal } from '@masknet/shared-base'
import { SwitchLogoModal } from './SwitchLogoModal.js'

import { memo } from 'react'

export const SwitchLogoDialog = new SingletonModal()

export const Modals = memo(function Modals() {
    return (
        <>
            <SwitchLogoModal ref={SwitchLogoDialog.register} />
        </>
    )
})
