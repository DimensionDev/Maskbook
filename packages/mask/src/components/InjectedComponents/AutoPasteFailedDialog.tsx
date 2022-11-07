import { useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { useI18N, useMatchXS, useQueryNavigatorPermission } from '../../utils/index.js'
import formatDateTime from 'date-fns/format'
import { makeStyles, useStylesExtends, useCustomSnackbar } from '@masknet/theme'
import {
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    TextField,
    Box,
    IconButton,
    Paper,
    Link,
    Button,
    Typography,
} from '@mui/material'
import type { AutoPasteFailedEvent } from '@masknet/shared-base'
import { DraggableDiv } from '../shared/DraggableDiv.js'
import { Close as CloseIcon, Download, OpenInBrowser } from '@mui/icons-material'
import { saveFileFromUrl } from '../../../shared/index.js'
import { Image } from '@masknet/shared'

export interface AutoPasteFailedDialogProps extends withClasses<never> {
    onClose: () => void
    data: AutoPasteFailedEvent
}
const useStyles = makeStyles()((theme) => ({
    title: { marginLeft: theme.spacing(1) },
    paper: {},
    button: { marginRight: theme.spacing(1) },
}))

export function AutoPasteFailedDialog(props: AutoPasteFailedDialogProps) {
    const { onClose, data } = props
    const { t } = useI18N()
    const { classes } = useStylesExtends(useStyles(), props)
    const url = data.image ? URL.createObjectURL(data.image) : undefined
    const { showSnackbar } = useCustomSnackbar()
    const [, copy] = useCopyToClipboard()
    const isMobile = useMatchXS()
    const permission = useQueryNavigatorPermission(true, 'clipboard-write')
    const fileName = `masknetwork-encrypted-${formatDateTime(Date.now(), 'yyyyMMddHHmmss')}.png`

    return (
        <DraggableDiv>
            <Paper elevation={2} className={classes.paper} style={isMobile ? { width: '100vw' } : undefined}>
                <nav>
                    <DialogTitle>
                        <IconButton size="small" onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                        <span className={classes.title}>{t('auto_paste_failed_dialog_title')}</span>
                    </DialogTitle>
                </nav>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText>
                        <Typography color="textPrimary" sx={{ marginBottom: 1 }}>
                            {t('auto_paste_failed_dialog_content')}
                        </Typography>
                    </DialogContentText>
                    {props.data.text ? (
                        <>
                            <TextField multiline fullWidth value={data.text} InputProps={{ readOnly: true }} />
                            <Box
                                sx={{
                                    marginBottom: 1,
                                }}
                            />
                            <Button
                                className={classes.button}
                                variant="contained"
                                onClick={() => {
                                    copy(data.text)
                                    showSnackbar(t('copy_success_of_text'), {
                                        variant: 'success',
                                        preventDuplicate: true,
                                        anchorOrigin: {
                                            vertical: 'top',
                                            horizontal: 'center',
                                        },
                                    })
                                    data.image ?? onClose()
                                }}>
                                {t('copy_text')}
                            </Button>
                        </>
                    ) : null}
                    <Box
                        sx={{
                            marginBottom: 1,
                        }}
                    />
                    <div style={{ textAlign: permission === 'granted' ? 'left' : 'center' }}>
                        {data.image ? (
                            // It must be img
                            <Image src={URL.createObjectURL(data.image)} style={{ height: 'auto' }} />
                        ) : null}
                        <Box
                            sx={{
                                marginBottom: 1,
                            }}
                        />
                        {permission === 'granted' ? (
                            <Button
                                className={classes.button}
                                variant="contained"
                                onClick={async () => {
                                    if (!data.image) return
                                    await navigator.clipboard.write([
                                        new ClipboardItem({ [data.image.type]: data.image }),
                                    ])
                                    showSnackbar(t('copy_success_of_image'), {
                                        variant: 'success',
                                        preventDuplicate: true,
                                        anchorOrigin: {
                                            vertical: 'top',
                                            horizontal: 'center',
                                        },
                                    })
                                }}>
                                {t('copy_image')}
                            </Button>
                        ) : null}
                        {url ? (
                            process.env.architecture === 'app' && process.env.engine === 'firefox' ? (
                                <Button
                                    className={classes.button}
                                    component={Link}
                                    variant="text"
                                    href={url}
                                    download={fileName}
                                    startIcon={<Download />}>
                                    {t('download')}
                                </Button>
                            ) : (
                                <Button
                                    className={classes.button}
                                    variant="text"
                                    onClick={() => saveFileFromUrl(url, fileName)}
                                    startIcon={<Download />}>
                                    {t('download')}
                                </Button>
                            )
                        ) : null}
                        {/* Open it in a new tab does not make sense for app. */}
                        {url && process.env.architecture === 'web' ? (
                            <Button
                                className={classes.button}
                                variant="text"
                                component={Link}
                                href={url}
                                target="_blank"
                                startIcon={<OpenInBrowser />}>
                                {t('auto_paste_failed_dialog_image_caption')}
                            </Button>
                        ) : null}
                    </div>
                </DialogContent>
                {/* To leave some bottom padding */}
                <DialogActions />
            </Paper>
        </DraggableDiv>
    )
}
export function useAutoPasteFailedDialog() {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<AutoPasteFailedEvent>({ text: '' })
    return [
        (data: AutoPasteFailedEvent) => {
            setData(data)
            setOpen(true)
        },
        open ? <AutoPasteFailedDialog onClose={() => setOpen(false)} data={data} /> : null,
    ] as const
}
