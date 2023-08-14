import { Button, DialogContent, Stack, Typography } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { PluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { SiteAdaptorContextRef } from '@masknet/plugin-infra/dom'
import { useI18N } from '../../locales/index.js'

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
    return SiteAdaptorContextRef.value.setMinimalMode(PluginID.GoPlusSecurity, true)
}
interface Props {
    open: boolean
    onClose(): void
}
function CheckSecurityConfirmDialog({ open, onClose }: Props) {
    const t = useI18N()
    const { classes } = useStyles()

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
