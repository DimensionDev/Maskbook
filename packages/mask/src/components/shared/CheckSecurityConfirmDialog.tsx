import { InjectedDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Button, DialogContent, Stack, Typography } from '@mui/material'
import { useI18N } from '../../utils'

const useStyles = makeStyles()((theme) => ({
    paper: {
        maxWidth: '320px !important',
        padding: '24px',
    },
    content: {
        marginLeft: 12,
        marginRight: 12,
        paddingLeft: 0,
        paddingRight: 0,
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

interface CheckSecurityConfirmDialogProps extends withClasses<never> {
    open: boolean
    onConfirm: () => void
    onClose: () => void
}

function CheckSecurityConfirmDialog(props: CheckSecurityConfirmDialogProps) {
    const { t } = useI18N()
    const { open, onConfirm, onClose } = props
    const { classes } = useStyles()

    return (
        <InjectedDialog open={open} onClose={onClose} classes={{ paper: classes.paper }}>
            <DialogContent className={classes.content}>
                <Stack alignItems="center">
                    <Typography style={{ fontSize: '14px', fontWeight: 500 }}>{t('close_check_security')}</Typography>
                    <Typography className={classes.intro}>{t('check_security_intro')}</Typography>
                    <Typography className={classes.intro}>{t('check_security_close_warning')}</Typography>
                    <Typography className={classes.intro}>{t('check_security_close_advice')}</Typography>
                </Stack>
                <Stack marginTop="36px">
                    <Button
                        className={classes.confirmButton}
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}>
                        {t('confirm')}
                    </Button>
                    <Button style={{ marginTop: '16px', borderRadius: '99px' }} onClick={onClose}>
                        {t('cancel')}
                    </Button>
                </Stack>
            </DialogContent>
        </InjectedDialog>
    )
}
export default CheckSecurityConfirmDialog
