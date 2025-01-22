import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { MemoryRouter } from 'react-router-dom'

import { RestorableScrollContext } from '@masknet/shared'
import { RoutePaths } from '../../constants.js'
import { RouterDialog } from '../components/RouterDialog.js'
import { SolRedPacketRoutes } from './Routes.js'
import { SOLRedPacketProvider } from '../contexts/SolRedpacketContext.js'
import { RedPacketTabs } from '../../types.js'

interface RedPacketDialogProps {
    onClose: () => void
    open: boolean
}

const useStyles = makeStyles()((theme) => ({
    paper: {
        width: 600,
        maxWidth: 'none',
        height: 620,
        boxShadow: 'none',
        backgroundImage: 'none',
        [theme.breakpoints.down('sm')]: {
            margin: 12,
        },
    },
    content: {
        padding: 0,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

const initialEntries = [RoutePaths.Exit, RoutePaths.CreateSolanaRedPacket]
export function SolRedPacketMainDialog({ onClose }: RedPacketDialogProps) {
    const { classes } = useStyles()

    const initialIndex = 1

    return (
        <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
            <SOLRedPacketProvider>
                <RouterDialog
                    pageMap={{
                        [RedPacketTabs.tokens]: RoutePaths.CreateSolanaRedPacket,
                        [RedPacketTabs.collectibles]: RoutePaths.CreateNftRedPacket,
                    }}
                    open
                    onClose={onClose}
                    classes={{ paper: classes.paper }}
                    maxWidth="xs"
                    fullWidth
                    independent>
                    <DialogContent className={classes.content}>
                        <RestorableScrollContext>
                            <SolRedPacketRoutes />
                        </RestorableScrollContext>
                    </DialogContent>
                </RouterDialog>
            </SOLRedPacketProvider>
        </MemoryRouter>
    )
}
