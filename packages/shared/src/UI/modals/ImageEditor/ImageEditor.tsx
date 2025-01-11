import { Trans } from '@lingui/react/macro'
import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'
import { EMPTY_OBJECT } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent, Slider } from '@mui/material'
import { useCallback, useState } from 'react'
import AvatarEditor, { type AvatarEditorProps } from 'react-avatar-editor'

const useStyles = makeStyles()((theme) => ({
    actions: {
        padding: 16,
        boxSizing: 'border-box',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    cancel: {
        '&:hover': {
            border: 'none',
            background: theme.palette.maskColor.bottom,
        },
    },
    content: {
        margin: 0,
        padding: 16,
        height: 500,
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
            display: 'none',
        },
        textAlign: 'center',
    },
}))

export interface ImageEditorProps extends InjectedDialogProps {
    image: string
    onSave?(blob: Blob | null): void
    AvatarEditorProps?: Omit<AvatarEditorProps, 'image'>
}

export function ImageEditor({ title, image, onSave, AvatarEditorProps = EMPTY_OBJECT, ...rest }: ImageEditorProps) {
    const { classes } = useStyles()
    const [editor, setEditor] = useState<AvatarEditor | null>(null)
    const [scale, setScale] = useState(1)

    const handleSave = useCallback(async () => {
        if (!editor) return
        editor.getImageScaledToCanvas().toBlob(async (blob) => {
            return onSave?.(blob)
        }, 'image/png')
    }, [editor, onSave])

    if (!image) return null

    return (
        <InjectedDialog title={title ?? <Trans>Edit</Trans>} {...rest}>
            <DialogContent className={classes.content}>
                <AvatarEditor
                    {...AvatarEditorProps}
                    ref={(e) => setEditor(e)}
                    image={image}
                    scale={AvatarEditorProps.scale ?? scale}
                    rotate={AvatarEditorProps.scale ?? 0}
                    border={AvatarEditorProps.border ?? 50}
                    borderRadius={AvatarEditorProps.borderRadius ?? 300}
                />
                <Slider
                    max={2}
                    min={0.5}
                    step={0.1}
                    defaultValue={1}
                    onChange={(_, value) => setScale(value as number)}
                    aria-label="Scale"
                    sx={{
                        color: (theme) => theme.palette.maskColor.primary,
                        '& .MuiSlider-thumb': {
                            width: 12,
                            height: 12,
                            backgroundColor: (theme) => theme.palette.maskColor.primary,
                        },
                        '& .MuiSlider-rail': {
                            opacity: 0.5,
                            backgroundColor: (theme) => theme.palette.maskColor.thirdMain,
                        },
                    }}
                />
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button className={classes.cancel} fullWidth variant="outlined" onClick={rest.onClose}>
                    <Trans>Cancel</Trans>
                </Button>
                <Button fullWidth onClick={handleSave}>
                    <Trans>Save</Trans>
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
