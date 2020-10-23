import React, { useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../utils/i18n-next-ui'
import { makeStyles } from '@material-ui/core/styles'
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
} from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import type { MaskbookMessages } from '../../utils/messages'
import { Image } from '../shared/Image'
import { useSnackbar } from 'notistack'
import { DraggableDiv } from '../shared/DraggableDiv'
import { useMatchXS } from '../../utils/hooks/useMatchXS'
import { useQueryNavigatorPermission } from '../../utils/hooks/useQueryNavigatorPermission'
import Download from '@material-ui/icons/CloudDownload'
import CloseIcon from '@material-ui/icons/Close'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'
import { formatDateTime } from '../../plugins/FileService/utils'

export interface AutoPasteFailedDialogProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onClose: () => void
    data: MaskbookMessages['autoPasteFailed']
}
const useStyles = makeStyles((theme) => ({
    title: { marginLeft: theme.spacing(1) },
    paper: { border: '1px solid white' },
}))

export function AutoPasteFailedDialog(props: AutoPasteFailedDialogProps) {
    const { t } = useI18N()
    const [url, setURL] = useState('')
    const classes = useStylesExtends(useStyles(), props)
    const { onClose, data } = props
    const { enqueueSnackbar } = useSnackbar()
    const [, copy] = useCopyToClipboard()
    const isMobile = useMatchXS()
    const permission = useQueryNavigatorPermission(true, 'clipboard-write')

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
                <DialogContent>
                    <DialogContentText>{t('auto_paste_failed_dialog_content')}</DialogContentText>
                    {props.data.text ? (
                        <>
                            <TextField
                                multiline
                                fullWidth
                                variant="outlined"
                                value={data.text}
                                InputProps={{ readOnly: true }}
                            />
                            <Box marginBottom={1}></Box>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    copy(data.text)
                                    enqueueSnackbar(t('copy_success_of_text'), {
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
                    <Box marginBottom={1}></Box>
                    <div style={{ textAlign: permission === 'granted' ? 'left' : 'center' }}>
                        {data.image ? (
                            // It must be img
                            <Image component="img" onURL={setURL} src={data.image} width={260} height={180} />
                        ) : null}
                        <Box marginBottom={1}></Box>
                        {permission === 'granted' ? (
                            <Button
                                variant="contained"
                                onClick={async () => {
                                    if (!data.image) return
                                    await navigator.clipboard.write([
                                        new ClipboardItem({ [data.image.type]: data.image }),
                                    ])
                                    enqueueSnackbar(t('copy_success_of_image'), {
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
                        {url && permission !== 'granted' ? (
                            <>
                                <Button
                                    variant="text"
                                    component={Link}
                                    download={`maskbook-encrypted-${formatDateTime(new Date()).replace(/:/g, '-')}.png`}
                                    href={url}
                                    startIcon={<Download />}>
                                    {t('download')}
                                </Button>
                                <Button
                                    variant="text"
                                    component={Link}
                                    href={url}
                                    target="_blank"
                                    startIcon={<OpenInBrowser />}>
                                    {t('auto_paste_failed_dialog_image_caption')}
                                </Button>
                            </>
                        ) : null}
                    </div>
                </DialogContent>
                {/* To leave some bottom padding */}
                <DialogActions></DialogActions>
            </Paper>
        </DraggableDiv>
    )
}
export function useAutoPasteFailedDialog() {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<MaskbookMessages['autoPasteFailed']>({ text: '' })
    return [
        (data: MaskbookMessages['autoPasteFailed']) => {
            setData(data)
            setOpen(true)
        },
        open ? <AutoPasteFailedDialog onClose={() => setOpen(false)} data={data} /> : null,
    ] as const
}
