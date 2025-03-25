import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, type BoxProps } from '@mui/material'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { memo, useState } from 'react'
import type { PortalContainerProps } from '../types.js'
import { GoogleDriveBackup } from './GoogleDriveBackup.js'
import { MaskNetworkBackup } from './MaskNetworkBackup.js'

const useStyles = makeStyles<void, 'activeButton'>()((theme, _, refs) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    providers: {
        display: 'flex',
        gap: theme.spacing(1.5),
    },
    providerName: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        height: 18,
    },
    activeButton: {
        backgroundColor: theme.palette.maskColor.input,
    },
    toggleButton: {
        backgroundColor: theme.palette.maskColor.bottom,
        cursor: 'pointer',
        boxSizing: 'border-box',
        borderRadius: 18,
        height: 34,
        gap: theme.spacing(1),
        border: `1px solid ${theme.palette.maskColor.line}`,
        display: 'inline-flex',
        padding: theme.spacing(1, 1.5),
        [`&.${refs.activeButton}`]: {
            backgroundColor: theme.palette.maskColor.input,
        },
    },
}))

enum CloudProvider {
    MaskNetwork = 'mask-network',
    GoogleDrive = 'google-drive',
}

interface Props extends BoxProps, PortalContainerProps {}
// cspell:disable
const clientId =
    process.env.GOOGLE_CLIENT_ID || '18954568633-c7has4fcrm5b7fop5si83fleb51oodji.apps.googleusercontent.com'
// cspell:enable
export const CloudBackup = memo<Props>(function CloudBackup({ portalContainerRef, ...rest }) {
    const { classes, cx } = useStyles()
    const [cloudProvider, setCloudProvider] = useState<CloudProvider>(CloudProvider.GoogleDrive)

    const isMaskNetwork = cloudProvider === CloudProvider.MaskNetwork

    return (
        <Box {...rest} className={classes.container}>
            <Box className={classes.providers}>
                <button
                    type="button"
                    className={cx(classes.toggleButton, isMaskNetwork ? classes.activeButton : null)}
                    onClick={() => setCloudProvider(CloudProvider.MaskNetwork)}>
                    <Icons.MaskBlue size={18} />
                    <Typography className={classes.providerName}>
                        <Trans>Mask Network</Trans>
                    </Typography>
                </button>
                <button
                    type="button"
                    className={cx(classes.toggleButton, isMaskNetwork ? null : classes.activeButton)}
                    onClick={() => setCloudProvider(CloudProvider.GoogleDrive)}>
                    <Icons.GoogleDrive size={18} />
                    <Typography className={classes.providerName}>
                        <Trans>Google Drive</Trans>
                    </Typography>
                </button>
            </Box>
            {isMaskNetwork ?
                <MaskNetworkBackup portalContainerRef={portalContainerRef} />
            :   <GoogleOAuthProvider clientId={clientId}>
                    <GoogleDriveBackup />
                </GoogleOAuthProvider>
            }
        </Box>
    )
})
