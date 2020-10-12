import React, { useState } from 'react'
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
} from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import type { MaskbookMessages } from '../../utils/messages'
import { DialogDismissIconUI } from './DialogDismissIcon'
import { Image } from '../shared/Image'
import { DraggableDiv } from '../shared/DraggableDiv'

export interface AutoPasteFailedDialogProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onClose: () => void
    data: MaskbookMessages['autoPasteFailed']
}
const useStyles = makeStyles((theme) => ({
    title: { marginLeft: theme.spacing(1) },
}))

export function AutoPasteFailedDialog(props: AutoPasteFailedDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { onClose, data } = props
    const [url, setURL] = useState('')

    return (
        <DraggableDiv>
            <Paper elevation={2}>
                <nav>
                    <DialogTitle>
                        <IconButton size="small" onClick={onClose}>
                            <DialogDismissIconUI />
                        </IconButton>
                        <span className={classes.title}>{t('auto_paste_failed_dialog_title')}</span>
                    </DialogTitle>
                </nav>
                <DialogContent>
                    <DialogContentText>{t('auto_paste_failed_dialog_content')}</DialogContentText>
                    {props.data.text ? (
                        <TextField
                            multiline
                            fullWidth
                            variant="outlined"
                            value={data.text}
                            InputProps={{ readOnly: true }}
                        />
                    ) : null}
                    <Box marginBottom={1}></Box>
                    <div style={{ textAlign: 'center' }}>
                        {data.image ? (
                            // It must be img
                            <Image component="img" onURL={setURL} src={data.image} width={360} height={260} />
                        ) : null}
                        <br />
                        {url ? (
                            <Link variant="caption" color="textPrimary" href={url} target="_blank">
                                {t('auto_paste_failed_dialog_image_caption')}
                            </Link>
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
