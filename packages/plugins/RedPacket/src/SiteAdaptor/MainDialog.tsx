import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { MemoryRouter } from 'react-router-dom'
import { RoutePaths } from '../constants.js'
import { RouterDialog } from './components/RouterDialog.js'

import { RedPacketRoutes } from './Routes.js'
import { RedPacketProvider } from './contexts/RedPacketContext.js'
import { RestorableScrollContext } from '@masknet/shared'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { RedPacketTabs } from '../types.js'

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

const initialEntries = [RoutePaths.Exit, RoutePaths.CreateTokenRedPacket]

export function RedPacketMainDialog({ onClose }: RedPacketDialogProps) {
    const { classes } = useStyles()

    const initialIndex = 1

    return (
        <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
            <EVMWeb3ContextProvider>
                <RedPacketProvider>
                    <RouterDialog
                        pageMap={{
                            [RedPacketTabs.tokens]: RoutePaths.CreateTokenRedPacket,
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
                                <RedPacketRoutes />
                            </RestorableScrollContext>
                        </DialogContent>
                    </RouterDialog>
                </RedPacketProvider>
            </EVMWeb3ContextProvider>
        </MemoryRouter>
    )
}
