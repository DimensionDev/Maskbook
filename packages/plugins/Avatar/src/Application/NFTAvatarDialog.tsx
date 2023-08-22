import { useMemo } from 'react'
import { Box, DialogContent } from '@mui/material'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { MemoryRouter } from 'react-router-dom'
import { AvatarRoutes, RoutePaths } from './Routes.js'
import { AvatarManagementProvider } from '../contexts/index.js'
import { RouterDialog } from './RouterDialog.js'
import type { InjectedDialogProps } from '@masknet/shared'
import { useLastRecognizedSocialIdentity } from '@masknet/plugin-infra/content-script'

const useStyles = makeStyles()({
    root: {
        margin: 0,
        minHeight: 564,
        padding: '0px !important',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    Box: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 564,
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
    const { isLoading, data: socialIdentity } = useLastRecognizedSocialIdentity()
    return (
        <MemoryRouter initialEntries={initialEntries} initialIndex={1}>
            <AvatarManagementProvider socialIdentity={socialIdentity}>
                <RouterDialog {...rest}>
                    <DialogContent className={classes.root}>
                        {isLoading ? (
                            <Box className={classes.Box}>
                                <LoadingBase />
                            </Box>
                        ) : (
                            <AvatarRoutes />
                        )}
                    </DialogContent>
                </RouterDialog>
            </AvatarManagementProvider>
        </MemoryRouter>
    )
}
