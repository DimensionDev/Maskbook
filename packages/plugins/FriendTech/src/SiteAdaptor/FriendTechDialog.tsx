import { makeStyles } from '@masknet/theme'
import { useAccount } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { DialogContent } from '@mui/material'
import { memo, useMemo } from 'react'
import { MemoryRouter } from 'react-router-dom'
import urlcat from 'urlcat'
import { RoutePaths } from '../constants.js'
import { FriendTechRoutes } from './Routes.js'
import { RouterDialog } from './components/RouterDialog.js'

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
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    actions: {
        padding: 0,
    },
}))
interface FriendTechDialogProps {
    onClose: () => void
    address?: string
}

export const FriendTechDialog = memo(function FriendTechDialog({ onClose, address }: FriendTechDialogProps) {
    const { classes } = useStyles()
    const account = useAccount()

    const initialEntries = useMemo(() => {
        if (!address) return [RoutePaths.Exit, RoutePaths.Main]
        const OpenEntry =
            isSameAddress(account, address) ?
                RoutePaths.Main
            :   {
                    pathname: RoutePaths.Detail,
                    search: '?' + urlcat('', { address }),
                }
        return [RoutePaths.Exit, OpenEntry]
    }, [account, address])
    return (
        <MemoryRouter initialEntries={initialEntries} initialIndex={1}>
            <RouterDialog open onClose={onClose} classes={{ paper: classes.paper }}>
                <DialogContent className={classes.content}>
                    <FriendTechRoutes />
                </DialogContent>
            </RouterDialog>
        </MemoryRouter>
    )
})
