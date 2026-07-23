import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { ActionButton, makeStyles, useSnackbar } from '@masknet/theme'
import { GoogleDriveClient } from '@masknet/web3-providers'
import { Box, Typography } from '@mui/material'
import { memo, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { UserContext } from '../../shared-ui/index.js'
import { checkAndRequestPermission, requestDriveAccessToken } from '../../shared/helpers/index.js'
import { clearGoogleDriveAccessToken, getGoogleDriveAccessToken } from '../utils/api.js'

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

export const GoogleDriveLogin = memo(function GoogleDriveLogin() {
    const { classes } = useStyles()
    const googleDriveClient = useMemo(
        () => new GoogleDriveClient(getGoogleDriveAccessToken, clearGoogleDriveAccessToken),
        [],
    )
    const { updateUser } = UserContext.useContainer()
    const { enqueueSnackbar } = useSnackbar()

    const [{ loading }, login] = useAsyncFn(async () => {
        try {
            const granted = await checkAndRequestPermission()
            if (!granted) return

            const userInfo = await googleDriveClient.login(true)
            await requestDriveAccessToken(true) // request permission to manipulate files
            updateUser({
                googleAccount: userInfo.email || '',
            })
        } catch {
            enqueueSnackbar(t`Authorization Failed`, {
                variant: 'warning',
                detail: t`Failed to authorize Google Drive. Please try again.`,
            })
        }
    }, [googleDriveClient, updateUser, enqueueSnackbar])
    return (
        <Box className={classes.container}>
            <Typography className={classes.title}>
                <Trans>Add google Drive</Trans>
            </Typography>
            <Typography className={classes.subtitle}>
                <Trans>
                    when you click Add Google Drive button，you will be forwarded to Google authorization pages.
                </Trans>
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: '48px' }}>
                <ActionButton variant="roundedContained" onClick={login} loading={loading}>
                    Add Google Drive
                </ActionButton>
            </Box>
        </Box>
    )
})
