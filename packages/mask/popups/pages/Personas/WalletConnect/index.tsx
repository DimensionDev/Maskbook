import { memo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { QRCode } from 'react-qrcode-logo'
import { CrossIsolationMessages, PopupRoutes } from '@masknet/shared-base'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        header: {
            background: theme.palette.maskColor.modalTitleBg,
            padding: theme.spacing(2),
        },
        icon: {
            padding: theme.spacing(1.2, 0),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            marginTop: 14,
            fontSize: 18,
            lineHeight: '22px',
            fontWeight: 700,
            textAlign: 'center',
        },
        qrcode: {
            width: 250,
            height: 250,
            boxShadow: theme.palette.maskColor.bottomBg,
            borderRadius: theme.spacing(2),
            overflow: 'hidden',
        },
        halo: {
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden',
            '&:before': {
                position: 'absolute',
                left: '-10%',
                top: 10,
                zIndex: 1,
                content: '""',
                height: 256,
                width: 256,
                backgroundImage:
                    isDark ?
                        'radial-gradient(50% 50.00% at 50% 50.00%, #443434 0%, rgba(68, 52, 52, 0.00) 100%)'
                    :   'radial-gradient(50% 50.00% at 50% 50.00%, #FFE9E9 0%, rgba(255, 233, 233, 0.00) 100%)',
            },
            '&:after': {
                position: 'absolute',
                left: '70%',
                top: 20,
                zIndex: 1,
                content: '""',
                height: 256,
                width: 256,
                backgroundImage:
                    isDark ?
                        'radial-gradient(50% 50.00% at 50% 50.00%, #605675 0%, rgba(56, 51, 67, 0.00) 100%)'
                    :   'radial-gradient(50% 50.00% at 50% 50.00%, #F0E9FF 0%, rgba(240, 233, 255, 0.00) 100%)',
            },
        },
        qrcodeContainer: {
            width: 282,
            margin: theme.spacing(2, 'auto', 0),
            padding: theme.spacing(2),
            backgroundColor: theme.palette.maskColor.bottom,
            position: 'relative',
            zIndex: 10,
        },
        tip: {
            fontSize: 12,
            marginTop: 10,
            textAlign: 'center',
            color: theme.palette.maskColor.second,
        },
    }
})

export const Component = memo(function WalletConnect() {
    const navigate = useNavigate()
    const { classes } = useStyles()
    const location = useLocation()
    const uri = location.state?.uri as string | undefined

    useEffect(() => {
        return CrossIsolationMessages.events.popupWalletConnectEvent.on(({ open }) => {
            if (open) return
            navigate(PopupRoutes.ConnectWallet, {
                replace: true,
            })
        })
    }, [])

    return (
        <Box>
            <Box className={classes.header}>
                <Box>
                    <Icons.ArrowBack onClick={() => navigate(-1)} />
                </Box>
                <Box className={classes.icon}>
                    <Icons.MaskWallet size={64} />
                </Box>
            </Box>
            <Typography className={classes.title}>
                <Trans>WalletConnect</Trans>
            </Typography>

            <div className={classes.halo}>
                <div className={classes.qrcodeContainer}>
                    <Box className={classes.qrcode}>
                        <QRCode value={uri} ecLevel="L" size={220} quietZone={16} eyeRadius={100} qrStyle="dots" />
                    </Box>
                </div>
            </div>
            <Typography className={classes.tip}>
                <Trans>Scan QR code with WalletConnect-compatible wallet</Trans>
            </Typography>
        </Box>
    )
})
