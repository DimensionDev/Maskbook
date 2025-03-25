import { Trans } from '@lingui/react/macro'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Box, Button, Typography, type BoxProps } from '@mui/material'
import { memo, useEffect } from 'react'
import { UserContext } from '../../../../../shared-ui/index.js'
import { requestGoogleDriveAccessToken } from '../helpers.js'
import { t } from '@lingui/core/macro'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        paddingBottom: theme.spacing(6),
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '20px',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '18px',
    },
}))

interface Props extends BoxProps {}
// cspell:disable
const clientId =
    process.env.GOOGLE_CLIENT_ID || '18954568633-c7has4fcrm5b7fop5si83fleb51oodji.apps.googleusercontent.com'
// cspell:enable
const SCOPE = 'https://www.googleapis.com/auth/drive.file'
const redirectUri = browser.runtime.getURL('oauth2.html')

const handleSignIn = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(SCOPE)}&access_type=offline`
    window.location.assign(authUrl)
}
export const GoogleDriveBackup = memo<Props>(function GoogleDriveBackup(props) {
    const { classes, cx } = useStyles()
    const { user, updateUser } = UserContext.useContainer()
    const { showSnackbar } = useCustomSnackbar()

    useEffect(() => {
        const controller = new AbortController()
        window.addEventListener(
            'message',
            async (event) => {
                if (!event.data.code) return
                const res = await requestGoogleDriveAccessToken({
                    code: event.data.code,
                    clientId,
                    redirectUri,
                })
                if (res.access_token) {
                    debugger
                    // TODO account
                    updateUser((user) => ({
                        ...user,
                        googleAccessToken: res.access_token,
                        googleAccount: res.access_token,
                    }))
                } else if (res.error_description) {
                    showSnackbar(t`Failed to login: ${res.error_description}`, { variant: 'error' })
                }
            },
            { signal: controller.signal },
        )
        return () => controller.abort()
    }, [])

    if (!user.googleAccount) {
        return (
            <Box {...props} className={cx(classes.container, props.className)}>
                <Typography className={classes.title}>
                    <Trans>Add google Drive</Trans>
                </Typography>
                <Typography className={classes.subtitle}>
                    <Trans>
                        when you click Add Google Drive button，you will be forwarded to Google authorization pages.
                    </Trans>
                </Typography>
                <Box display="flex" justifyContent="center" mt="48px">
                    <Button variant="contained" onClick={handleSignIn}>
                        Add Google Drive
                    </Button>
                </Box>
            </Box>
        )
    }
    return (
        <Box {...props}>
            <Box>
                <Typography>test@gmail.com</Typography>
                <Button variant="text">Switch other accounts</Button>
            </Box>
        </Box>
    )
})
