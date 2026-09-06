import { Box, Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()(() => ({
    text: {
        fontSize: 16,
        textAlign: 'center',
    },
}))

export interface AccountConnectStatusProps {
    /** Whether the current browser account already connected to Mask before. */
    connected?: boolean
    /** Whether this is the very first time this account connects. */
    isFirstConnection?: boolean
    /** Twitter's verification flow posts a tweet instead of connecting instantly. */
    isTwitterPage?: boolean
    /** The account the payload expects the user to be signed in as. */
    expectAccount: string
    /** The account the user is currently signed in as, if known. */
    currentUserId?: string
    siteName: string
    /** Called when the user dismisses the "already connected" state. */
    onDone?: () => void
}

/**
 * The status message shown inside the setup guide's "connect persona" step
 * (packages/mask/content-script/components/InjectedComponents/SetupGuide/AccountConnectStatus.tsx),
 * after BindingDialog chrome and the loading state are handled by the container.
 */
export function AccountConnectStatus(props: AccountConnectStatusProps) {
    const { connected, isFirstConnection, isTwitterPage, expectAccount, currentUserId, siteName, onDone } = props
    const { classes } = useStyles()

    if (isFirstConnection) {
        return isTwitterPage ?
                <>
                    <Typography className={classes.text}>Sent verification post successfully.</Typography>
                    <Typography className={classes.text} sx={{ mt: '1.5em' }}>
                        You could check the verification result on Mask Pop-up after few minutes. If failed, try sending
                        verification post again.
                    </Typography>
                </>
            :   <>
                    <Typography className={classes.text}>Connected successfully.</Typography>
                    <Typography className={classes.text} sx={{ mt: '1.5em' }}>
                        Trying exploring more features powered by Mask Network.
                    </Typography>
                </>
    }

    if (connected)
        return (
            <>
                <Typography className={classes.text}>
                    <b>@{currentUserId}</b> connected already.
                </Typography>
                <Typography className={classes.text} sx={{ mt: '1.5em' }}>
                    Change another account and try again.
                </Typography>
                <Box sx={{ mt: 'auto', width: '100%' }}>
                    <Button fullWidth onClick={onDone}>
                        Done
                    </Button>
                </Box>
            </>
        )

    if (currentUserId)
        return (
            <>
                <Typography className={classes.text}>Current account is not the verifying account.</Typography>
                <Typography className={classes.text} sx={{ mt: '1.5em' }}>
                    Please switch to <b>@{expectAccount}</b> to continue the account verification progress.
                </Typography>
            </>
        )

    return <Typography className={classes.text}>Please sign up or login {siteName} to connect Mask Network.</Typography>
}
