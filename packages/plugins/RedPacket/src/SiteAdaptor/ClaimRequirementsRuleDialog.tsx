import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Box, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material'
import { memo } from 'react'
import { Alert } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { Trans } from '@lingui/macro'

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
    const { classes } = useStyles()

    return usePortalShadowRoot((container) => (
        <Dialog container={container} open={open} onClose={onClose} classes={{ paper: classes.paper }}>
            <DialogTitle className={classes.dialogTitle}>
                <Typography className={classes.title}>
                    <Trans>Claim Requirements</Trans>
                </Typography>
                <Icons.Close onClick={onClose} />
            </DialogTitle>
            <DialogContent>
                <Alert open>
                    <Trans>
                        Use Lucky Drop quests to grow your followers and engagement. Each requirement must be completed
                        to be eligible to claim.
                    </Trans>
                </Alert>
                <Box mt={3} display="flex" flexDirection="column" rowGap={3}>
                    <Box>
                        <Typography className={classes.subtitle}>
                            <Trans>Follow me</Trans>
                        </Typography>
                        <Typography className={classes.description}>
                            <Trans>
                                User must follow your account. Note: When you cross-post a Lucky Drop to multiple social
                                networks, following you on any social allows users to claim.
                            </Trans>
                        </Typography>
                    </Box>
                    <Box>
                        <Typography className={classes.subtitle}>
                            <Trans>Like / Repost / Comment</Trans>
                        </Typography>
                        <Typography className={classes.description}>
                            <Trans>Users must like, repost / quote tweet, or comment on your Lucky Drop post.</Trans>
                        </Typography>
                    </Box>
                    <Box>
                        <Typography className={classes.subtitle}>
                            <Trans>NFT holder</Trans>
                        </Typography>
                        <Typography className={classes.description}>
                            <Trans>Users must hold one NFT from the collection you select.</Trans>
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    ))
})
