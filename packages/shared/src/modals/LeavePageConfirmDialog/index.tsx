import { forwardRef, useState } from 'react'
import type { DashboardRoutes, SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '../../hooks/useSingletonModal.js'
import { LeavePageConfirm, type OpenPageConfirm } from './LeavePageConfirm.js'

export interface LeavePageConfirmDialogOpenProps {
    openDashboard?: (route?: DashboardRoutes, search?: string) => ReturnType<typeof browser.tabs.create>
    info?: OpenPageConfirm
}

export interface LeavePageConfirmDialogProps {}

export const LeavePageConfirmModal = forwardRef<
    SingletonModalRefCreator<LeavePageConfirmDialogOpenProps>,
    LeavePageConfirmDialogProps
>((props, ref) => {
    const [openDashboard, setOpenDashboard] =
        useState<(route?: DashboardRoutes, search?: string) => ReturnType<typeof browser.tabs.create>>()
    const [info, setInfo] = useState<OpenPageConfirm>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setOpenDashboard(() => props?.openDashboard)
            setInfo(props?.info)
        },
    })

    if (!open) return null
    return <LeavePageConfirm info={info} openDashboard={openDashboard} open onClose={() => dispatch?.close()} />
})
