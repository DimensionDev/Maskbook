import { Button, DialogActions, DialogContent } from '@mui/material'
import { makeStyles, MaskDialog, useCustomSnackbar } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { isNil } from 'lodash-unified'
import { useState } from 'react'
import { useI18N } from '../locales/i18n_generated'
import { WalletMessages } from '@masknet/plugin-wallet'
import { Entry } from './components'
import { META_KEY_2 } from '../constants'
import { Exchange } from './hooks/Exchange'
import type { FileInfo, DialogCloseCallback } from '../types'
import { useCompositionContext } from '@masknet/plugin-infra/content-script'

interface Props {
    onClose: () => void
    open: boolean
}

const useStyles = makeStyles()((theme) => ({
    actions: {
        alignSelf: 'center',
    },
    button: {
        borderRadius: 26,
        marginTop: 24,
        fontSize: 16,
        lineHeight: 2.5,
        paddingLeft: 35,
        paddingRight: 35,
    },
    paper: {
        width: '600px !important',
        maxWidth: 'none',
        boxShadow: 'none',
        backgroundImage: 'none',
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            display: 'block !important',
            margin: 12,
        },
    },
}))

const FileServiceDialog: React.FC<Props> = (props) => {
    const t = useI18N()
    const { classes } = useStyles()
    const { showSnackbar } = useCustomSnackbar()
    const [uploading, setUploading] = useState(false)
    const [selectedFileInfo, setSelectedFileInfo] = useState<FileInfo | null>(null)
    const { attachMetadata, dropMetadata } = useCompositionContext()
    const { closeDialog: closeWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    const onInsert = () => {
        if (isNil(selectedFileInfo)) {
            return
        }
        if (selectedFileInfo) {
            attachMetadata(META_KEY_2, JSON.parse(JSON.stringify(selectedFileInfo)))
        } else {
            dropMetadata(META_KEY_2)
        }
        closeWalletStatusDialog()
        props.onClose()
    }

    let onDialogCloseCallback: DialogCloseCallback | null
    const callDialogClose = () => {
        try {
            onDialogCloseCallback?.()
        } catch (error) {}
        onDialogCloseCallback = null
    }

    const onDecline = () => {
        if (onDialogCloseCallback) {
            callDialogClose()
            return
        }
        if (!uploading) {
            props.onClose()
            return
        }
        showSnackbar(t.uploading_on_cancel())
    }
    const onDialogClose = (cb: DialogCloseCallback) => {
        onDialogCloseCallback = cb
    }
    return (
        <MaskDialog
            DialogProps={{ scroll: 'paper', classes: { paper: classes.paper } }}
            open={props.open}
            title={t.__display_name()}
            onClose={onDecline}>
            <DialogContent>
                <Exchange onDialogClose={onDialogClose} onUploading={setUploading} onInsert={setSelectedFileInfo}>
                    <Entry />
                </Exchange>
            </DialogContent>
            <DialogActions classes={{ root: classes.actions }}>
                <Button
                    variant="contained"
                    classes={{ root: classes.button }}
                    onClick={onInsert}
                    disabled={isNil(selectedFileInfo)}>
                    {t.on_insert()}
                </Button>
            </DialogActions>
        </MaskDialog>
    )
}

export default FileServiceDialog
