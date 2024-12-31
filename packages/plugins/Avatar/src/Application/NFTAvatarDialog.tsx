import type { InjectedDialogProps } from '@masknet/shared'
import { useMemo } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AvatarManagementProvider } from '../contexts/AvatarManagement.js'
import { RouterDialog } from './RouterDialog.js'
import { RoutePaths } from './Routes.js'

interface NFTAvatarDialogProps extends InjectedDialogProps {
    startPicking?: boolean
}

export function NFTAvatarDialog({ startPicking, ...rest }: NFTAvatarDialogProps) {
    const initialEntries = useMemo(() => {
        return [RoutePaths.Exit, startPicking ? RoutePaths.NFTPicker : RoutePaths.Personas]
    }, [startPicking])

    return (
        <MemoryRouter initialEntries={initialEntries} initialIndex={1}>
            <AvatarManagementProvider>
                <RouterDialog {...rest} />
            </AvatarManagementProvider>
        </MemoryRouter>
    )
}
