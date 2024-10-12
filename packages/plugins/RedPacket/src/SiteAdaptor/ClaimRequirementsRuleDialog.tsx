import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Box, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material'
import { memo } from 'react'
import { useRedPacketTrans } from '../locales/index.js'
import { Alert } from '@masknet/shared'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    paper: {
        margin: 0,
        background: theme.palette.maskColor.bottom,
        maxWidth: 400,
    },
    dialogTitle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        lineHeight: '18px',
        fontWeight: 700,
        margin: 'auto',
    },
    subtitle: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        marginBottom: theme.spacing(1.5),
    },
    description: {
        fontSize: 14,
        lineHeight: '18px',
    },
}))

export interface ClaimRequirementsRuleDialogProps {
    open: boolean
    onClose: () => void
}

export const ClaimRequirementsRuleDialog = memo<ClaimRequirementsRuleDialogProps>(function ClaimRequirementsRuleDialog({
    open,
    onClose,
}) {
    const t = useRedPacketTrans()
    const { classes } = useStyles()

    return usePortalShadowRoot((container) => (
        <Dialog container={container} open={open} onClose={onClose} classes={{ paper: classes.paper }}>
            <DialogTitle className={classes.dialogTitle}>
                <Icons.Close onClick={onClose} />
                <Typography className={classes.title}>{t.claim_requirements_title()}</Typography>
            </DialogTitle>
            <DialogContent>
                <Alert open>{t.claim_requirements_rule_tips()}</Alert>
                <Box mt={3} display="flex" flexDirection="column" rowGap={3}>
                    <Box>
                        <Typography className={classes.subtitle}>{t.follow_me()}</Typography>
                        <Typography className={classes.description}>{t.follow_me_description()}</Typography>
                    </Box>
                    <Box>
                        <Typography className={classes.subtitle}>{t.reaction_title()}</Typography>
                        <Typography className={classes.description}>{t.reaction_description()}</Typography>
                    </Box>
                    <Box>
                        <Typography className={classes.subtitle}>{t.nft_holder()}</Typography>
                        <Typography className={classes.description}>{t.nft_holder_description()}</Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    ))
})
