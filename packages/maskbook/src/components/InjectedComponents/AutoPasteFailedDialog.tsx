import { useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { useI18N, MaskMessages, useMatchXS, useQueryNavigatorPermission } from '../../utils'
import formatDateTime from 'date-fns/format'
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
import { Image } from '../shared/Image'
import { useSnackbar } from '@masknet/theme'
import { DraggableDiv } from '../shared/DraggableDiv'
import Download from '@material-ui/icons/CloudDownload'
import CloseIcon from '@material-ui/icons/Close'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'
import { saveAsFileFromUrl } from '../../extension/background-script/HelperService'

export interface AutoPasteFailedDialogProps extends withClasses<never> {
    onClose: () => void
    data: MaskMessages['autoPasteFailed']
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
    const fileName = `maskbook-encrypted-${formatDateTime(Date.now(), 'yyyyMMddHHmmss')}.png`

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
                            <TextField multiline fullWidth value={data.text} InputProps={{ readOnly: true }} />
                            <Box
                                sx={{
                                    marginBottom: 1,
                                }}
                            />
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
                    <Box
                        sx={{
                            marginBottom: 1,
                        }}
                    />
                    <div style={{ textAlign: permission === 'granted' ? 'left' : 'center' }}>
                        {data.image ? (
                            // It must be img
                            <Image component="img" onURL={setURL} src={data.image} width={260} height={180} />
                        ) : null}
                        <Box
                            sx={{
                                marginBottom: 1,
                            }}
                        />
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
                        {url ? (
                            process.env.architecture === 'app' && process.env.target === 'firefox' ? (
                                <Button
                                    component={Link}
                                    variant="text"
                                    href={url}
                                    download={fileName}
                                    startIcon={<Download />}>
                                    {t('download')}
                                </Button>
                            ) : (
                                <Button
                                    variant="text"
                                    onClick={() => saveAsFileFromUrl(url, fileName)}
                                    startIcon={<Download />}>
                                    {t('download')}
                                </Button>
                            )
                        ) : null}
                        {/* Open it in a new tab does not make sense for app. */}
                        {url && process.env.architecture === 'web' ? (
                            <Button
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
    const [data, setData] = useState<MaskMessages['autoPasteFailed']>({ text: '' })
    return [
        (data: MaskMessages['autoPasteFailed']) => {
            setData(data)
            setOpen(true)
        },
        open ? <AutoPasteFailedDialog onClose={() => setOpen(false)} data={data} /> : null,
    ] as const
}
