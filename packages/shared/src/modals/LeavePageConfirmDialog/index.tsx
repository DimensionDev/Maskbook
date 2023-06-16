import { forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '../../hooks/useSingletonModal.js'
import { LeavePageConfirm, type OpenPageConfirm } from './LeavePageConfirm.js'

export interface LeavePageConfirmDialogOpenProps {
    openDashboard?: () => Promise<any>
    info?: OpenPageConfirm
}

export interface LeavePageConfirmDialogProps {}

export const LeavePageConfirmModal = forwardRef<
    SingletonModalRefCreator<LeavePageConfirmDialogOpenProps>,
    LeavePageConfirmDialogProps
>((props, ref) => {
    const [openDashboard, setOpenDashboard] = useState<() => Promise<void>>()
    const [info, setInfo] = useState<OpenPageConfirm>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setOpenDashboard(props?.openDashboard)
            setInfo(props?.info)
        },
    })

    if (!open) return null
    return <LeavePageConfirm info={info} openDashboard={openDashboard} open onClose={() => dispatch?.close()} />
})
