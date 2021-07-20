import { memo } from 'react'
import { Alert, AlertTitle, Box, makeStyles, Typography } from '@material-ui/core'
import { MaskWalletIcon, ImportWalletIcon } from '@masknet/icons'
import { EnterDashboard } from '../../../../components/EnterDashboard'
import { NetworkSelector } from '../NetworkSelector'

const useStyles = makeStyles((theme) => ({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    alert: {
        padding: '0px 10px',
    },
    alertTitle: {
        fontWeight: 600,
        fontSize: 12,
        color: theme.palette.primary.main,
        marginBottom: 3,
    },
    alertContent: {
        fontSize: 12,
        lineHeight: '16px',
        color: theme.palette.primary.main,
    },
    header: {
        padding: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 1,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 500,
    },
    content: {
        flex: 1,
        backgroundColor: '#f7f9fa',
    },
    item: {
        padding: '8px 16px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        marginBottom: 1,
        cursor: 'pointer',
    },
    itemTitle: {
        fontSize: 16,
        lineHeight: 1.5,
        color: theme.palette.primary.main,
        fontWeight: 600,
        marginLeft: 15,
    },
}))

export const WalletStartUp = memo(() => {
    const classes = useStyles()
    return (
        <Box className={classes.container}>
            <Alert icon={false} severity="info" className={classes.alert}>
                <AlertTitle className={classes.alertTitle}>Welcome</AlertTitle>
                <Typography className={classes.alertContent}>
                    Connect to your Wallet，Create a new wallet or recover an existing wallet using a seed phrase.
                </Typography>
            </Alert>
            <Box className={classes.content}>
                <Box className={classes.header}>
                    <Typography className={classes.title}>New Wallet</Typography>
                    <NetworkSelector />
                </Box>
                <Box className={classes.item}>
                    <MaskWalletIcon sx={{ fontSize: 20 }} />
                    <Typography className={classes.itemTitle}>New Wallet</Typography>
                </Box>
                <Box className={classes.item}>
                    <ImportWalletIcon sx={{ fontSize: 20 }} />
                    <Typography className={classes.itemTitle}>Import the wallet</Typography>
                </Box>
            </Box>
            <EnterDashboard />
        </Box>
    )
})
