import { Paper } from '@mui/material'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import type { FileInfo } from '../types.js'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { DisplayingFileList } from './components/FileList.js'
import { useCallback } from 'react'
import { PluginFileServiceRPC } from './rpc.js'
import { downloadFile } from '../helpers.js'
import { Trans } from '@lingui/macro'

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

    const { showSnackbar } = useCustomSnackbar()
    const handleSave = useCallback(
        async (file: FileInfo) => {
            try {
                await PluginFileServiceRPC.setFileInfo(file)
                showSnackbar(<Trans>File saved successfully</Trans>, {
                    variant: 'success',
                    message: <Trans>You’ve saved {file.name} to Web3 file service.</Trans>,
                })
            } catch (err) {
                showSnackbar(<Trans>Failed to save file</Trans>, {
                    variant: 'error',
                    message: <Trans>Failed to save the file. Please try again.</Trans>,
                })
            }
        },
        [showSnackbar, showSnackbar],
    )

    return (
        <Paper elevation={0} className={classes.root}>
            <DisplayingFileList className={classes.file} files={files} onSave={handleSave} onDownload={downloadFile} />
        </Paper>
    )
}
