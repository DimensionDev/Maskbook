import { Paper } from '@mui/material'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import type { FileInfo } from '../types.js'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { DisplayingFileList } from './components/FileList.js'
import { useCallback } from 'react'
import { PluginFileServiceRPC } from '../Worker/rpc.js'
import { downloadFile } from '../helpers.js'
import { useI18N } from '../locales/i18n_generated.js'

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
    const t = useI18N()

    const { showSnackbar } = useCustomSnackbar()
    const handleSave = useCallback(
        async (file: FileInfo) => {
            try {
                await PluginFileServiceRPC.setFileInfo(file)
                showSnackbar(t.save_file_title({ context: 'success' }), {
                    variant: 'success',
                    message: t.save_file_message({ context: 'success', name: file.name }),
                })
            } catch (err) {
                showSnackbar(t.save_file_title({ context: 'failed' }), {
                    variant: 'error',
                    message: t.save_file_message({ context: 'failed', name: file.name }),
                })
            }
        },
        [showSnackbar, showSnackbar, t],
    )

    return (
        <Paper elevation={0} className={classes.root}>
            <DisplayingFileList className={classes.file} files={files} onSave={handleSave} onDownload={downloadFile} />
        </Paper>
    )
}
