import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { GoogleDriveClient } from '@masknet/web3-providers'
import { Box, Button, Typography } from '@mui/material'
import { memo, useMemo } from 'react'
import { UserContext } from '../../shared-ui/index.js'
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
    const { showSnackbar } = useCustomSnackbar()

    const login = async () => {
        try {
            const userInfo = await googleDriveClient.getUserInfo()
            updateUser({
                googleAccount: userInfo.email || '',
            })
        } catch (err) {
            showSnackbar(t`Failed to login: ${(err as Error).message}`, { variant: 'error' })
        }
    }
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
            <Box display="flex" justifyContent="center" mt="48px">
                <Button variant="contained" onClick={login}>
                    Add Google Drive
                </Button>
            </Box>
        </Box>
    )
})
