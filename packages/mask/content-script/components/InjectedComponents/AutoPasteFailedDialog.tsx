import { useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { format as formatDateTime } from 'date-fns'
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
import { Image } from '@masknet/shared'
import type { AutoPasteFailedEvent } from '@masknet/shared-base'
import { useMatchXS } from '@masknet/shared-base-ui'
import { DraggableDiv } from '../shared/DraggableDiv.js'
import { Close as CloseIcon, Download, OpenInBrowser } from '@mui/icons-material'
import { saveFileFromUrl } from '../../../shared/index.js'
import { Trans } from '@lingui/macro'

interface AutoPasteFailedDialogProps {
    data: AutoPasteFailedEvent
    onClose: () => void
}
const useStyles = makeStyles()((theme) => ({
    title: { marginLeft: theme.spacing(1) },
    paper: {},
    button: { marginRight: theme.spacing(1) },
}))

function AutoPasteFailedDialog(props: AutoPasteFailedDialogProps) {
    const { onClose, data } = props
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
                        <span className={classes.title}>
                            <Trans>Paste manually</Trans>
                        </span>
                    </DialogTitle>
                </nav>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText component="div">
                        <Typography color="textPrimary" sx={{ marginBottom: 1 }}>
                            <Trans>Please copy the following text and image (if there is one) and publish it.</Trans>
                        </Typography>
                    </DialogContentText>
                    {props.data.text ?
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
                                    showSnackbar(<Trans>Text copied!</Trans>, {
                                        variant: 'success',
                                        preventDuplicate: true,
                                        anchorOrigin: {
                                            vertical: 'top',
                                            horizontal: 'center',
                                        },
                                    })
                                    data.image ?? onClose()
                                }}>
                                <Trans>Copy text</Trans>
                            </Button>
                        </>
                    :   null}
                    <Box marginBottom={1} />
                    <Box textAlign="left">
                        {data.image ?
                            // It must be img
                            <Image src={URL.createObjectURL(data.image)} style={{ width: '100%' }} />
                        :   null}
                        <Box marginBottom={1} />
                        <Button
                            className={classes.button}
                            variant="contained"
                            onClick={async () => {
                                if (!data.image) return
                                await navigator.clipboard.write([new ClipboardItem({ [data.image.type]: data.image })])
                                showSnackbar(<Trans>Image copied!</Trans>, {
                                    variant: 'success',
                                    preventDuplicate: true,
                                    anchorOrigin: {
                                        vertical: 'top',
                                        horizontal: 'center',
                                    },
                                })
                            }}>
                            <Trans>Copy image</Trans>
                        </Button>
                        {url ?
                            <Button
                                className={classes.button}
                                variant="text"
                                onClick={() => saveFileFromUrl(url, fileName)}
                                startIcon={<Download />}>
                                <Trans>Download</Trans>
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
                                <Trans>Open in a new tab</Trans>
                            </Button>
                        :   null}
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
