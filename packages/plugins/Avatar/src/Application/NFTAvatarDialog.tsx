import { useMemo } from 'react'
import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { MemoryRouter } from 'react-router-dom'
import { AvatarRoutes, RoutePaths } from './Routes.js'
import { AvatarManagementProvider } from '../contexts/index.js'
import { RouterDialog } from './RouterDialog.js'
import type { InjectedDialogProps } from '@masknet/shared'

const useStyles = makeStyles()({
    root: {
        margin: 0,
        minHeight: 564,
        padding: '0px !important',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
})

interface NFTAvatarDialogProps extends InjectedDialogProps {
    startPicking?: boolean
}

export function NFTAvatarDialog({ startPicking, ...rest }: NFTAvatarDialogProps) {
    const { classes } = useStyles()

    const initialEntries = useMemo(() => {
        return [RoutePaths.Exit, startPicking ? RoutePaths.NFTPicker : RoutePaths.Personas]
    }, [!startPicking])
    return (
        <MemoryRouter initialEntries={initialEntries} initialIndex={1}>
            <AvatarManagementProvider>
                <RouterDialog {...rest}>
                    <DialogContent className={classes.root}>
                        <AvatarRoutes />
                    </DialogContent>
                </RouterDialog>
            </AvatarManagementProvider>
        </MemoryRouter>
    )
}
