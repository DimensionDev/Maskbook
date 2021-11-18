import { Button, DialogActions, DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared'
import { isNil } from 'lodash-es'
import { useCustomSnackbar } from '@masknet/theme'
import { useState } from 'react'
import { useI18N } from '../../../utils'
import { WalletMessages } from '../../Wallet/messages'
import { InjectedDialog, InjectedDialogProps } from '../../../components/shared/InjectedDialog'
import { Entry } from './components'
import { META_KEY_2 } from '../constants'
import { Exchange } from './hooks/Exchange'
import type { FileInfo } from '../types'
import { useCompositionContext } from '../../../components/CompositionDialog/CompositionContext'

interface Props extends InjectedDialogProps {
    onClose: () => void
}

const useStyles = makeStyles()({
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
})
const FileServiceDialog: React.FC<Props> = (props) => {
    const { t } = useI18N()
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
    const onDecline = () => {
        if (!uploading) {
            props.onClose()
            return
        }
        showSnackbar(t('plugin_file_service_uploading_on_cancel'))
    }
    return (
        <InjectedDialog open={props.open} title={t('plugin_file_service_display_name')} onClose={onDecline}>
            <DialogContent>
                <Exchange onUploading={setUploading} onInsert={setSelectedFileInfo}>
                    <Entry />
                </Exchange>
            </DialogContent>
            <DialogActions classes={{ root: classes.actions }}>
                <Button
                    variant="contained"
                    classes={{ root: classes.button }}
                    onClick={onInsert}
                    disabled={isNil(selectedFileInfo)}>
                    {t('plugin_file_service_on_insert')}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}

export default FileServiceDialog
