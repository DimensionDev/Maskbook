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
const useStyles = makeStyles({
    title: { marginLeft: 8 },
})

export function AutoPasteFailedDialog(props: AutoPasteFailedDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { onClose, data } = props

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
                            // Set component to undefined if the following bug has been resolved:
                            // https://bugs.chromium.org/p/chromium/issues/detail?id=1136804
                            // https://bugzilla.mozilla.org/show_bug.cgi?id=1670200
                            <Image component="canvas" src={data.image} width={360} height={260}></Image>
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
