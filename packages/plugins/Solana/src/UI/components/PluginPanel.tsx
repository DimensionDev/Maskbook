import { CopyIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { useAccount } from '@masknet/web3-shared-solana'
import { Box, Button, IconButton, Typography } from '@mui/material'
import { useCallback } from 'react'
import { useCopyToClipboard } from 'react-use'
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
    label: {
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

    const { value: account } = useAccount()
    const address = '0x000000000'
    const balance = '10'
    const [, copyToClipboard] = useCopyToClipboard()

    const onLogIn = useCallback(() => console.log('login'), [])
    const onSignUp = useCallback(() => console.log('signup'), [])
    const onLogOut = useCallback(() => console.log('logout'), [])

    console.log(account)

    if (address)
        return (
            <Box className={classes.root}>
                <Box className={classes.main}>
                    <Box sx={{ marginBottom: 3 }}>
                        <Typography className={classes.label} color="textPrimary">
                            Profile Information
                        </Typography>
                    </Box>
                    <Box display="flex">
                        <Typography color="textSecondary">{address}</Typography>
                        <IconButton size="small" sx={{ marginLeft: 0.5 }} onClick={() => copyToClipboard(address)}>
                            <CopyIcon className={classes.copy} />
                        </IconButton>
                    </Box>
                    <Box display="flex" sx={{ marginTop: 1, marginBottom: 1 }}>
                        <Typography className={classes.balance} variant="h4" color="textPrimary">
                            {balance} Solana
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
