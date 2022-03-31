import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import AvatarEditor from 'react-avatar-editor'
import { makeStyles } from '@masknet/theme'
import { useState } from 'react'

const useStyles = makeStyles()(() => ({
    root: {},
}))

interface UploadAvatarDialogProps {
    open: boolean
    image: string | File
}

export function UploadAvatarDialog(props: UploadAvatarDialogProps) {
    const { image, open } = props
    const { classes } = useStyles()
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)

    return (
        <InjectedDialog open={open} title="Edit Profile">
            <DialogContent>
                <AvatarEditor
                    ref={(e) => setEditor(e)}
                    image={image}
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
            </DialogContent>
            <DialogActions>
                <Button>Cancel</Button>
                <Button>Save</Button>
            </DialogActions>
        </InjectedDialog>
    )
}
