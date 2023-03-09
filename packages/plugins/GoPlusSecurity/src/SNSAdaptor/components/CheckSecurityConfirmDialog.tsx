import { useEffect, useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { CrossIsolationMessages, PluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Button, DialogContent, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales/index.js'
import { context } from '../context.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        maxWidth: '320px !important',
        padding: 0,
    },
    content: {
        padding: '48px 24px',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    intro: {
        fontSize: '14px',
        marginTop: '24px',
        color: theme.palette.grey[700],
    },
    confirmButton: {
        backgroundColor: theme.palette.maskColor.warn,
        color: theme.palette.maskColor.white,
        borderRadius: '99px',
    },
}))

function onConfirm() {
    return context.setMinimalMode(PluginID.GoPlusSecurity, true)
}
function CheckSecurityConfirmDialog() {
    const t = useI18N()
    const { classes } = useStyles()

    const [open, setOpen] = useState(false)

    useEffect(() => {
        return CrossIsolationMessages.events.checkSecurityConfirmationDialogEvent.on(({ open }) => {
            setOpen(open)
        })
    }, [])

    const onClose = () => setOpen(false)

    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            classes={{ paper: classes.paper, dialogContent: classes.content }}>
            <DialogContent className={classes.content}>
                <Stack alignItems="center">
                    <Typography style={{ fontSize: '14px', fontWeight: 500 }}>{t.close_check_security()}</Typography>
                    <Typography className={classes.intro}>{t.check_security_intro()}</Typography>
                    <Typography className={classes.intro}>{t.check_security_close_warning()}</Typography>
                    <Typography className={classes.intro}>{t.check_security_close_advice()}</Typography>
                </Stack>
                <Stack marginTop="36px">
                    <Button
                        className={classes.confirmButton}
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}>
                        {t.confirm()}
                    </Button>
                    <Button style={{ marginTop: '16px', borderRadius: '99px' }} onClick={onClose}>
                        {t.cancel()}
                    </Button>
                </Stack>
            </DialogContent>
        </InjectedDialog>
    )
}
export default CheckSecurityConfirmDialog
