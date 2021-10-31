import { useCallback } from 'react'
import { useCopyToClipboard } from 'react-use'
import { CopyIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Button, IconButton, Typography } from '@mui/material'
import { useAccount, useFCL } from '@masknet/web3-shared-flow'
import { useI18N } from '../../locales'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: 350,
        padding: theme.spacing(0, 2, 0, 3),
    },
    main: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    copy: {
        width: 16,
        height: 16,
        cursor: 'pointer',
        stroke: theme.palette.text.secondary,
    },
    lable: {
        fontSize: 18,
    },
    balance: {
        fontSize: 24,
    },
    image: {
        width: 24,
        height: 24,
    },
}))

export interface PluginPanelProps {}

export function PluginPanel(props: PluginPanelProps) {
    const t = useI18N()
    const { classes } = useStyles()

    const fcl = useFCL()
    const { value: account } = useAccount()
    const [, copyToClipboard] = useCopyToClipboard()

    const onLogIn = useCallback(() => fcl.logIn(), [fcl])
    const onSignUp = useCallback(() => fcl.signUp(), [fcl])
    const onLogOut = useCallback(() => fcl.unauthenticate(), [fcl])

    console.log(account)

    if (account?.address)
        return (
            <Box className={classes.root}>
                <Box className={classes.main}>
                    <Box sx={{ marginBottom: 3 }}>
                        <Typography className={classes.lable} color="textPrimary">
                            Profile Information
                        </Typography>
                    </Box>
                    <Box display="flex">
                        <Typography color="textSecondary">{account.address}</Typography>
                        <IconButton
                            size="small"
                            sx={{ marginLeft: 0.5 }}
                            onClick={() => copyToClipboard(account.address)}>
                            <CopyIcon className={classes.copy} />
                        </IconButton>
                    </Box>
                    <Box display="flex" sx={{ marginTop: 1, marginBottom: 1 }}>
                        <Typography className={classes.balance} variant="h4" color="textPrimary">
                            {account.balance} FLOW
                        </Typography>
                    </Box>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="center">
                    <Button variant="contained" color="primary" onClick={onLogOut}>
                        {t.button_log_out()}
                    </Button>
                </Box>
            </Box>
        )

    return (
        <Box className={classes.root}>
            <Box className={classes.main}>
                <Typography color="textPrimary">{t.card_state_text_no_profile()}</Typography>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Button variant="contained" color="primary" onClick={onLogIn}>
                    {t.button_log_in()}
                </Button>
                <Button variant="contained" color="primary" sx={{ marginLeft: 1 }} onClick={onSignUp}>
                    {t.button_sign_up()}
                </Button>
            </Box>
        </Box>
    )
}
