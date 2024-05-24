import { useState } from 'react'
import type { DashboardRoutes, SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { LeavePageConfirm, type OpenPageConfirm } from './LeavePageConfirm.js'

export interface LeavePageConfirmModalOpenProps {
    openDashboard?: (route: DashboardRoutes, search?: string) => void
    info?: OpenPageConfirm
}

export function LeavePageConfirmModal({ ref }: SingletonModalProps<LeavePageConfirmModalOpenProps>) {
    const [openDashboard, setOpenDashboard] = useState<(route: DashboardRoutes, search?: string) => void>()
    const [info, setInfo] = useState<OpenPageConfirm>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setOpenDashboard(() => props.openDashboard)
            setInfo(props.info)
        },
    })

    if (!open) return null
    return <LeavePageConfirm info={info} openDashboard={openDashboard} open onClose={() => dispatch?.close()} />
}
