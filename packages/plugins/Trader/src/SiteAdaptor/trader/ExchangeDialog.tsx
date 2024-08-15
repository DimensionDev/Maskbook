import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { Box } from '@mui/system'
import { memo } from 'react'
import { matchPath, MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { RouterDialog } from '../components/RouterDialog.js'
import { RoutePaths } from '../constants.js'
import { ExchangeRoutes } from './Routes.js'

const useStyles = makeStyles()((theme) => ({
    icons: {
        display: 'flex',
        gap: theme.spacing(1),
    },
    icon: {
        width: 24,
        height: 24,
        cursor: 'pointer',
    },
    dialog: {
        padding: theme.spacing(3, 2),
        scrollbarColor: 'initial',
    },
    dialogPaper: {
        width: 600,
        height: 620,
    },
    content: {
        padding: 0,
        overflow: 'auto',
        boxSizing: 'border-box',
        scrollbarWith: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))
export interface ExchangeDialogProps {
    onClose: () => void
    toAddress?: string
    toChainId?: number
}

export const Dialog = memo<ExchangeDialogProps>(function Dialog({ onClose }) {
    const { classes } = useStyles()

    const { pathname } = useLocation()
    const match = matchPath(RoutePaths.Swap, pathname)
    const navigate = useNavigate()

    return (
        <RouterDialog
            open
            onClose={onClose}
            className={classes.dialog}
            classes={{
                paper: classes.dialogPaper,
            }}
            sx={{ p: 3 }}
            titleTail={
                match ?
                    <Box className={classes.icons}>
                        <Icons.History
                            size={24}
                            className={classes.icon}
                            onClick={() => {
                                navigate(RoutePaths.History)
                            }}
                        />
                    </Box>
                :   null
            }>
            <DialogContent className={classes.content}>
                <ExchangeRoutes />
            </DialogContent>
        </RouterDialog>
    )
})

const initialEntries = [RoutePaths.Exit, RoutePaths.Swap]
export const ExchangeDialog = memo<ExchangeDialogProps>(function ExchangeDialog(props) {
    return (
        <MemoryRouter initialEntries={initialEntries} initialIndex={1}>
            <Dialog {...props} />
        </MemoryRouter>
    )
})
