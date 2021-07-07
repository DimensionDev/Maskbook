import { DialogContent } from '@material-ui/core'
import { useCallback } from 'react'
import { useI18N } from '../../../utils'
import { InjectedDialog, InjectedDialogProps } from '../../../components/shared/InjectedDialog'
import { UploadFilePage } from './MainDialog/UploadFilePage'
import { UploadFileProgress } from './MainDialog/UploadProgress'
import { FilePath } from './MainDialog/FileName'

export interface FileServiceDialogNewProps extends InjectedDialogProps {
    onClose: () => void
}

export const FileServiceDialogNew: React.FC<FileServiceDialogNewProps> = ({ open, onClose }) => {
    const { t } = useI18N()

    const onInsert = useCallback(() => {}, [])

    return (
        <InjectedDialog title={t('plugin_file_service_display_name')} open={open} onClose={onClose}>
            <DialogContent>
                <FilePath name="All" />
                <UploadFilePage />
                <UploadFileProgress />
            </DialogContent>
        </InjectedDialog>
    )
}
