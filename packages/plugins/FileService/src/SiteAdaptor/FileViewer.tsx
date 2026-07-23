import { Paper } from '@mui/material'
import { makeStyles, useSnackbar } from '@masknet/theme'
import type { FileInfo } from '../types.js'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { DisplayingFileList } from './components/FileList.js'
import { useCallback } from 'react'
import { PluginFileServiceRPC } from './rpc.js'
import { downloadFile } from '../helpers.js'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()({
    file: {
        width: '100%',
    },
    root: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        userSelect: 'none',
        padding: 0,
        backgroundColor: 'transparent',
    },
})

export function FileViewer({ files }: { files: FileInfo[] }) {
    usePluginWrapper(true)
    const { classes } = useStyles()

    const { enqueueSnackbar } = useSnackbar()
    const handleSave = useCallback(
        async (file: FileInfo) => {
            try {
                await PluginFileServiceRPC.setFileInfo(file)
                enqueueSnackbar(<Trans>File saved</Trans>, {
                    variant: 'success',
                    detail: <Trans>You've saved {file.name} to Web3 file service.</Trans>,
                })
            } catch {
                enqueueSnackbar(<Trans>Failed to save file</Trans>, {
                    variant: 'error',
                    detail: <Trans>Failed to save the file. Please try again.</Trans>,
                })
            }
        },
        [enqueueSnackbar],
    )

    return (
        <Paper elevation={0} className={classes.root}>
            <DisplayingFileList className={classes.file} files={files} onSave={handleSave} onDownload={downloadFile} />
        </Paper>
    )
}
