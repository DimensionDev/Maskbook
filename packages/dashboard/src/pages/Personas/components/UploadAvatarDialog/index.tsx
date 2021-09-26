import { DocumentIcon } from '@masknet/icons'
import { MaskDialog } from '@masknet/theme'
import { Box, Button, DialogContent, Slider } from '@material-ui/core'
import { memo, useCallback, useState } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { useStateList } from 'react-use'
import FileUpload from '../../../../components/FileUpload'
import { useDashboardI18N } from '../../../../locales'
import { updatePersonaAvatar } from '../../api'

interface UploadAvatarDialogProps {
    open: boolean
    onClose(): void
}

const uploadSteps = ['upload', 'pick']

export const UploadAvatarDialog = memo<UploadAvatarDialogProps>(({ open, onClose }) => {
    const t = useDashboardI18N()

    const { state: step, next } = useStateList(uploadSteps)
    const [file, setFile] = useState<File>()
    const [scale, setScale] = useState(1)
    const [editor, setEditor] = useState<AvatarEditor | null>(null)

    const onSave = useCallback(() => {
        if (!editor || !file) return

        editor.getImage().toBlob((blob) => {
            if (blob) {
                updatePersonaAvatar(blob)
            }
        }, file.type)

        onClose()
    }, [editor, file])

    return (
        <MaskDialog open={open} title={t.personas_upload_avatar()} onClose={onClose}>
            <DialogContent sx={{ width: 440 }}>
                {step === 'upload' && (
                    <Box sx={{ mb: 2 }}>
                        <FileUpload
                            height={300}
                            onChange={(file) => {
                                setFile(file)
                                next()
                            }}
                            accept="image/png, image/jpeg"
                            icon={<DocumentIcon />}
                        />
                    </Box>
                )}
                {step === 'pick' && (
                    <>
                        <AvatarEditor
                            ref={(e) => setEditor(e)}
                            image={file!}
                            border={50}
                            style={{ width: '100%', height: '100%' }}
                            scale={scale ?? 1}
                            rotate={0}
                            borderRadius={300}
                        />
                        <Slider
                            max={2}
                            min={0.5}
                            step={0.1}
                            defaultValue={1}
                            onChange={(_, value) => setScale(value as number)}
                            aria-label="Scale"
                        />
                        <Button fullWidth sx={{ mb: 2 }} variant="contained" onClick={onSave}>
                            {t.save()}
                        </Button>
                    </>
                )}
            </DialogContent>
        </MaskDialog>
    )
})
