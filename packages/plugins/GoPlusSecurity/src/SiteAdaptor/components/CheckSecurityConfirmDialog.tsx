import { Button, DialogContent, Stack, Typography } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Trans } from '@lingui/macro'

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
        backgroundColor: `${theme.palette.maskColor.warn} !important`,
        color: theme.palette.maskColor.white,
        borderRadius: '99px',
    },
}))

export const onConfirm = {
    f: () => {},
}
interface Props {
    open: boolean
    onClose(): void
}
function CheckSecurityConfirmDialog({ open, onClose }: Props) {
    const { classes } = useStyles()

    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            classes={{ paper: classes.paper, dialogContent: classes.content }}>
            <DialogContent className={classes.content}>
                <Stack alignItems="center">
                    <Typography style={{ fontSize: '14px', fontWeight: 500 }}>
                        <Trans>Close [Check Security]?</Trans>
                    </Typography>
                    <Typography className={classes.intro}>
                        <Trans>
                            The [Check Security] dApp provides quick, reliable, and convenient Web3 security services.
                        </Trans>
                    </Typography>
                    <Typography className={classes.intro}>
                        <Trans>
                            If you decide to close [Check Security], you will no longer see security notifications when
                            interacting with suspicious, blacklisted, or potentially fraudulent contracts and addresses.
                        </Trans>
                    </Typography>
                    <Typography className={classes.intro}>
                        <Trans>We recommend new Web3 users to keep [Check Security] open.</Trans>
                    </Typography>
                </Stack>
                <Stack marginTop="36px">
                    <Button
                        className={classes.confirmButton}
                        onClick={() => {
                            onConfirm.f()
                            onClose()
                        }}>
                        <Trans>Confirm</Trans>
                    </Button>
                    <Button style={{ marginTop: '16px', borderRadius: '99px' }} onClick={onClose}>
                        <Trans>Cancel</Trans>
                    </Button>
                </Stack>
            </DialogContent>
        </InjectedDialog>
    )
}
export default CheckSecurityConfirmDialog
