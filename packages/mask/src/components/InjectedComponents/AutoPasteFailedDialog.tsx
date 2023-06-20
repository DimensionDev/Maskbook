import { useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../utils/index.js'
import formatDateTime from 'date-fns/format'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
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
import { Image, useMatchXS } from '@masknet/shared'

export interface AutoPasteFailedDialogProps {
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
    const { classes } = useStyles()
    const url = data.image ? URL.createObjectURL(data.image) : undefined
    const { showSnackbar } = useCustomSnackbar()
    const [, copy] = useCopyToClipboard()
    const isMobile = useMatchXS()
    const fileName = `masknetwork-encrypted-${formatDateTime(Date.now(), 'yyyyMMddHHmmss')}.png`

    return (
        <DraggableDiv>
            <Paper elevation={2} className={classes.paper} sx={isMobile ? { width: '100vw' } : undefined}>
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
                    <Box marginBottom={1} />
                    <Box textAlign="left">
                        {data.image ? (
                            // It must be img
                            <Image src={URL.createObjectURL(data.image)} style={{ width: '100%' }} />
                        ) : null}
                        <Box marginBottom={1} />
                        <Button
                            className={classes.button}
                            variant="contained"
                            onClick={async () => {
                                if (!data.image) return
                                await navigator.clipboard.write([new ClipboardItem({ [data.image.type]: data.image })])
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
                        {url ? (
                            <Button
                                className={classes.button}
                                variant="text"
                                onClick={() => saveFileFromUrl(url, fileName)}
                                startIcon={<Download />}>
                                {t('download')}
                            </Button>
                        ) : null}
                        {url ? (
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
                    </Box>
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
