import { useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { format as formatDateTime } from 'date-fns'
import { makeStyles, useSnackbar } from '@masknet/theme'
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
import { useMatchXS } from '@masknet/shared-base-ui'
import { Close as CloseIcon, Download, OpenInBrowser } from '@mui/icons-material'

export interface AutoPasteFailedDialogProps {
    data: AutoPasteFailedEvent
    onClose: () => void
    /** Called with a downloadable object URL and a suggested file name, e.g. saveFileFromUrl(url, fileName). */
    onDownload: (url: string, fileName: string) => void
}
const useStyles = makeStyles()((theme) => ({
    title: { marginLeft: theme.spacing(1) },
    paper: {},
    button: { marginRight: theme.spacing(1) },
}))

export function AutoPasteFailedDialog(props: AutoPasteFailedDialogProps) {
    const { onClose, data, onDownload } = props
    const { classes } = useStyles()
    // eslint-disable-next-line @eslint-react/purity
    const url = data.image ? URL.createObjectURL(data.image) : undefined
    const { enqueueSnackbar } = useSnackbar()
    const [, copy] = useCopyToClipboard()
    const isMobile = useMatchXS()
    // eslint-disable-next-line @eslint-react/purity
    const fileName = `masknetwork-encrypted-${formatDateTime(Date.now(), 'yyyyMMddHHmmss')}.png`

    return (
        <Paper elevation={2} className={classes.paper} sx={isMobile ? { width: '100vw' } : undefined}>
            <nav>
                <DialogTitle>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                    <span className={classes.title}>Paste manually</span>
                </DialogTitle>
            </nav>
            <DialogContent sx={{ paddingTop: 0 }}>
                <DialogContentText component="div">
                    <Typography color="textPrimary" sx={{ marginBottom: 1 }}>
                        Please copy the following text and image (if there is one) and publish it.
                    </Typography>
                </DialogContentText>
                {data.text ?
                    <>
                        <TextField multiline fullWidth value={data.text} slotProps={{ input: { readOnly: true } }} />
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
                                enqueueSnackbar('Text copied!', {
                                    variant: 'success',
                                    preventDuplicate: true,
                                    anchorOrigin: {
                                        vertical: 'top',
                                        horizontal: 'center',
                                    },
                                })
                                if (!data.image) onClose()
                            }}>
                            Copy text
                        </Button>
                    </>
                :   null}
                <Box sx={{ marginBottom: 1 }} />
                <Box sx={{ textAlign: 'left' }}>
                    {data.image ?
                        // It must be img
                        // eslint-disable-next-line @eslint-react/purity
                        <img src={URL.createObjectURL(data.image)} style={{ width: '100%' }} />
                    :   null}
                    <Box sx={{ marginBottom: 1 }} />
                    <Button
                        className={classes.button}
                        variant="contained"
                        onClick={async () => {
                            if (!data.image) return
                            await navigator.clipboard.write([new ClipboardItem({ [data.image.type]: data.image })])
                            enqueueSnackbar('Image copied!', {
                                variant: 'success',
                                preventDuplicate: true,
                                anchorOrigin: {
                                    vertical: 'top',
                                    horizontal: 'center',
                                },
                            })
                        }}>
                        Copy image
                    </Button>
                    {url ?
                        <Button
                            className={classes.button}
                            variant="text"
                            onClick={() => onDownload(url, fileName)}
                            startIcon={<Download />}>
                            Download
                        </Button>
                    :   null}
                    {url ?
                        <Button
                            className={classes.button}
                            variant="text"
                            component={Link}
                            href={url}
                            target="_blank"
                            startIcon={<OpenInBrowser />}>
                            Open in a new tab
                        </Button>
                    :   null}
                </Box>
            </DialogContent>
            {/* To leave some bottom padding */}
            <DialogActions />
        </Paper>
    )
}

export function useAutoPasteFailedDialogState() {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<AutoPasteFailedEvent>({ text: '' })
    return {
        show: (data: AutoPasteFailedEvent) => {
            setData(data)
            setOpen(true)
        },
        open,
        data,
        close: () => setOpen(false),
    }
}
