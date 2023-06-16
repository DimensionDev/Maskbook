import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { useMemo } from 'react'
import { MemoryRouter } from 'react-router-dom'
import urlcat from 'urlcat'
import { RoutePaths } from '../constants.js'
import { RouterDialog } from './components/RouterDialog.js'
import { FileManagementProvider, UIProvider } from './contexts/index.js'
import { FileRoutes } from './Routes.js'
import { useTermsConfirmed } from './storage.js'

export interface FileServiceDialogProps {
    onClose: () => void
    open: boolean
    selectMode?: boolean
    selectedFileIds?: string[]
    compositionType: CompositionType
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
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

function FileServiceDialog({ onClose, selectMode, selectedFileIds, compositionType }: FileServiceDialogProps) {
    const { classes } = useStyles()
    const [confirmed] = useTermsConfirmed()

    const initialEntries = useMemo(() => {
        const OpenEntry = selectMode
            ? {
                  pathname: RoutePaths.FileSelector,
                  search: '?' + urlcat('', { selectedFileIds }),
              }
            : RoutePaths.Browser
        return [RoutePaths.Exit, OpenEntry, RoutePaths.Terms]
    }, [selectMode, selectedFileIds])
    const initialIndex = confirmed ? 1 : 2

    return (
        <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
            <FileManagementProvider compositionType={compositionType}>
                <RouterDialog
                    open
                    onClose={onClose}
                    classes={{ paper: classes.paper }}
                    maxWidth="xs"
                    fullWidth
                    independent>
                    <DialogContent className={classes.content}>
                        <UIProvider>
                            <FileRoutes />
                        </UIProvider>
                    </DialogContent>
                </RouterDialog>
            </FileManagementProvider>
        </MemoryRouter>
    )
}

export default FileServiceDialog
