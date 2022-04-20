import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { resolveProviderHomeLink, useProviderType } from '@masknet/web3-shared-evm'
import { Box, Button, Link, Typography } from '@mui/material'
import { ApplicationIcon } from '../assets/application'
import { WalletIcon } from '../assets/wallet'
import LaunchIcon from '@mui/icons-material/Launch'
import { useI18N } from '../locales/i18n_generated'

const useStyles = makeStyles()((theme) => ({
    root: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(249, 55, 55, 0.2) 100%), #FFFFFF',
        borderRadius: 16,
        padding: 8,
        position: 'relative',
        height: 196,
        margin: theme.spacing(2),
    },
    title: {
        display: 'flex',
        color: '#07101b',
    },
    button: {
        textAlign: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 16,
        width: '100%',
    },
    link: {
        padding: 0,
        marginLeft: theme.spacing(0.5),
        marginTop: 2,
        color: '#6E767D',
    },
    rectangle: {
        position: 'absolute',
        top: 64,
    },
}))

interface NFTWalletConnectProps extends withClasses<'root'> {}

export function NFTWalletConnect(props: NFTWalletConnectProps) {
    const classes = useStylesExtends(useStyles(), props)
    const providerType = useProviderType()
    const t = useI18N()

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    return (
        <Box className={classes.root}>
            <Box className={classes.title}>
                <ApplicationIcon />
                <Typography variant="body1" fontSize={15} fontWeight={700} sx={{ flex: 1 }}>
                    {t.application_dialog_title()}
                </Typography>

                <Typography variant="body1" color="#536471">
                    {t.provider_by()}
                </Typography>
                <Typography variant="body1" color="#07101b" fontWeight={500}>
                    {providerType}
                </Typography>
                <Link
                    className={classes.link}
                    href={resolveProviderHomeLink(providerType)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={stop}>
                    <LaunchIcon fontSize="small" />
                </Link>
            </Box>
            <Rectangle classes={{ root: classes.rectangle }} />
            <Box className={classes.button}>
                <Button
                    onClick={openSelectProviderDialog}
                    style={{ width: 254, backgroundColor: '#07101b', color: 'white' }}
                    startIcon={<WalletIcon style={{ width: 18, height: 18 }} />}>
                    {t.connect_your_wallet()}
                </Button>
            </Box>
        </Box>
    )
}

const useRectangleStyles = makeStyles()(() => ({
    root: {},
    rectangle: {
        height: 8,
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
    },
}))
interface RectangleProps extends withClasses<'root'> {}

export function Rectangle(props: RectangleProps) {
    const classes = useStylesExtends(useRectangleStyles(), props)
    return (
        <div className={classes.root}>
            <div className={classes.rectangle} style={{ width: 103 }} />
            <div className={classes.rectangle} style={{ width: 68, marginTop: 4 }} />
            <div className={classes.rectangle} style={{ width: 48, marginTop: 4 }} />
        </div>
    )
}
