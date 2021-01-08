import { Button, DialogActions, DialogContent, DialogProps, makeStyles } from '@material-ui/core'
import { isNil } from 'lodash-es'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useBeforeUnload } from 'react-use'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { InjectedDialog } from '../../components/shared/InjectedDialog'
import type { AbstractTabProps } from '../../extension/options-page/DashboardComponents/AbstractTab'
import { editActivatedPostMetadata } from '../../social-network/ui'
import { useI18N } from '../../utils/i18n-next-ui'
import { Entry, SiaEntry } from './components'
import { META_KEY_1 } from './constants'
import { Exchange } from './hooks/Exchange'
import type { FileInfo } from './types'

interface Props extends withClasses<never> {
    open: boolean
    onConfirm: (file: FileInfo | undefined) => void
    onDecline: () => void
    DialogProps?: Partial<DialogProps>
}

const useStyles = makeStyles({
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
    const classes = useStylesExtends(useStyles(), props)
    const snackbar = useSnackbar()
    const [uploading, setUploading] = useState(false)
    const [selectedFileInfo, setSelectedFileInfo] = useState<FileInfo | null>(null)
    useBeforeUnload(uploading)
    const onInsert = () => {
        if (isNil(selectedFileInfo)) {
            return
        }
        editActivatedPostMetadata((next) => {
            if (selectedFileInfo) {
                // Make a Date become string
                next.set(META_KEY_1, JSON.parse(JSON.stringify(selectedFileInfo)))
            } else {
                next.delete(META_KEY_1)
            }
        })
        props.onConfirm(selectedFileInfo)
    }
    const onDecline = () => {
        if (!uploading) {
            props.onDecline()
            return
        }
        snackbar.enqueueSnackbar(t('plugin_file_service_uploading_on_cancal'))
    }

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_file_service_arweave'),
                children: (
                    <Exchange onUploading={setUploading} onInsert={setSelectedFileInfo}>
                        <Entry />
                    </Exchange>
                ),
                sx: { p: 0 },
            },
            {
                label: t('plugin_file_service_skynet'),
                children: (
                    <Exchange onUploading={setUploading} onInsert={setSelectedFileInfo}>
                        <SiaEntry />
                    </Exchange>
                ),
                sx: { p: 0 },
            },
        ],
        state,
    }
}

    return (
        <InjectedDialog open={props.open} title={t('plugin_file_service_display_name')} onClose={onDecline}>
            <DialogContent>
                <AbstractTab height={450} {...tabProps} />
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
