import { memo } from 'react'
import { Alert, AlertTitle, Box, makeStyles, Typography } from '@material-ui/core'
import { ImportWalletIcon, MasksIcon } from '@masknet/icons'
import { EnterDashboard } from '../../../../components/EnterDashboard'

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

export const PersonaStartUp = memo(() => {
    const classes = useStyles()
    return (
        <Box className={classes.container}>
            <Alert icon={false} severity="info" className={classes.alert}>
                <AlertTitle className={classes.alertTitle}>Welcome</AlertTitle>
                <Typography className={classes.alertContent}>
                    Connect to your Personas，Create a new Personas or Restore backups.
                </Typography>
            </Alert>
            <Box className={classes.content}>
                <Box className={classes.item}>
                    <MasksIcon sx={{ fontSize: 20 }} />
                    <Typography className={classes.itemTitle}>New Persona</Typography>
                </Box>
                <Box className={classes.item}>
                    <ImportWalletIcon sx={{ fontSize: 20 }} />
                    <Typography className={classes.itemTitle}>Restore Backups</Typography>
                </Box>
            </Box>
            <EnterDashboard />
        </Box>
    )
})
