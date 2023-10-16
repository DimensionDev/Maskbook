import { memo } from 'react'
import { Box, DialogContent, Typography } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { SmartPayTrans, useSmartPayTrans } from '../../locales/i18n_generated.js'
import { PluginSmartPayMessages } from '../../message.js'

const useStyles = makeStyles()((theme) => ({
    dialogContent: {
        padding: theme.spacing(2),
        minHeight: 564,
        boxSizing: 'border-box',
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '20px',
    },
    content: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
    },
    strong: {
        color: theme.palette.maskColor.main,
    },
}))

export function InjectSmartPayDescriptionDialog() {
    const { open, closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDescriptionDialogEvent)
    return open ? <SmartPayDescriptionDialog open onClose={closeDialog} /> : null
}

interface Props {
    open: boolean
    onClose(): void
}
const SmartPayDescriptionDialog = memo(function SmartPayDescriptionDialog({ open, onClose }: Props) {
    const t = useSmartPayTrans()
    const { classes } = useStyles()
    return (
        <InjectedDialog open={open} onClose={onClose} title={t.what_is_smart_pay()}>
            <DialogContent className={classes.dialogContent}>
                <Typography className={classes.title}>{t.what_is_smart_pay_title()}</Typography>
                <Typography sx={{ my: 3 }} className={classes.content}>
                    {t.smart_pay_description()}
                </Typography>
                <Typography className={classes.title}>{t.setup_smart_pay_title()}</Typography>
                <Box component="ul">
                    <Typography component="li" className={classes.content}>
                        <SmartPayTrans.setup_smart_pay_one
                            components={{ strong: <strong className={classes.strong} /> }}
                        />
                    </Typography>
                    <Typography component="li" className={classes.content}>
                        {t.setup_smart_pay_two()}
                    </Typography>
                </Box>
                <Typography className={classes.title}>{t.erc_4337_features_title()}</Typography>
                <Box component="ul">
                    <Typography component="li" className={classes.content}>
                        {t.erc_4337_features_one()}
                    </Typography>
                    <Typography component="li" className={classes.content}>
                        {t.erc_4337_features_two()}
                    </Typography>
                    <Typography component="li" className={classes.content}>
                        {t.erc_4337_features_three()}
                    </Typography>
                    <Typography component="li" className={classes.content}>
                        {t.erc_4337_features_four()}
                    </Typography>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
})
