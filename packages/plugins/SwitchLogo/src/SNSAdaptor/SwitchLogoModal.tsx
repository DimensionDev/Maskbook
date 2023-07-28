import { forwardRef } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { SwitchLogoDialog } from './SwitchLogoDialog.js'

export type SwitchLogoModalOpenProps = void

export interface SwitchLogoModalProps {}

export const SwitchLogoModal = forwardRef<SingletonModalRefCreator, SwitchLogoModalProps>((props, ref) => {
    const [open, dispatch] = useSingletonModal(ref)

    if (!open) return null
    return <SwitchLogoDialog open onClose={() => dispatch?.close()} />
})
