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
} from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import ShadowRootDialog from '../../utils/shadow-root/ShadowRootDialog'
import type { MaskbookMessages } from '../../utils/messages'
import { DialogDismissIconUI } from './DialogDismissIcon'
import { Image } from '../shared/Image'

export interface AutoPasteFailedDialogProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    open: boolean
    onClose: () => void
    data: MaskbookMessages['autoPasteFailed']
}
const useStyles = makeStyles({
    title: { marginLeft: 8 },
})

export function AutoPasteFailedDialog(props: AutoPasteFailedDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { onClose } = props

    return (
        <ShadowRootDialog disableEnforceFocus onClose={onClose} open={props.open} scroll="paper" disableAutoFocus>
            <DialogTitle>
                <IconButton size="small" onClick={props.onClose}>
                    <DialogDismissIconUI />
                </IconButton>
                <span className={classes.title}>{t('auto_paste_failed_dialog_title')}</span>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>{t('auto_paste_failed_dialog_content')}</DialogContentText>
                {props.data.text ? (
                    <TextField
                        multiline
                        fullWidth
                        variant="outlined"
                        value={props.data.text}
                        InputProps={{ readOnly: true }}
                    />
                ) : null}
                <Box marginBottom={1}></Box>
                <div style={{ textAlign: 'center' }}>
                    {props.data.image ? <Image src={props.data.image} width={360} height={260}></Image> : null}
                </div>
            </DialogContent>
            {/* To leave some bottom padding */}
            <DialogActions></DialogActions>
        </ShadowRootDialog>
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
        <AutoPasteFailedDialog onClose={() => setOpen(false)} open={open} data={data} />,
    ] as const
}
