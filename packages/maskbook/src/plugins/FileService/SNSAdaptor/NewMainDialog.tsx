import { DialogContent } from '@material-ui/core'
import type { FC } from 'react'
import { InjectedDialog, InjectedDialogProps } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils'
import { FilePath } from './MainDialog/FileName'
import { UploadFilePage } from './MainDialog/UploadFilePage'
import { UploadFileProgress } from './MainDialog/UploadProgress'

export interface FileServiceDialogNewProps extends InjectedDialogProps {
    onClose: () => void
}

export const FileServiceDialogNew: FC<FileServiceDialogNewProps> = ({ open, onClose }) => {
    const { t } = useI18N()
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
