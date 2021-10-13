import { memo } from 'react'
import { Box, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useEnterDashboard } from '../../hook/useEnterDashboard'
import { useRouteMatch } from 'react-router-dom'
import { PopupRoutes } from '../../index'
import { MasksIcon, MaskWalletIcon } from '@masknet/icons'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
    },
    placeholder: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 10px',
    },
    button: {
        fontWeight: 600,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 14,
        lineHeight: 1.5,
        borderRadius: 20,
    },
})

export const InitialPlaceholder = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const matchWallet = useRouteMatch(PopupRoutes.Wallet)
    const onEnter = useEnterDashboard()

    return (
        <Box className={classes.container}>
            <Box className={classes.placeholder}>
                <Box
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        marginBottom: 10,
                        backgroundColor: '#F7F9FA',
                        fontSize: 48,
                    }}>
                    {matchWallet ? <MaskWalletIcon fontSize="inherit" /> : <MasksIcon fontSize="inherit" />}
                </Box>
                <Typography style={{ fontSize: 14 }}>
                    {t('popups_initial_tips', {
                        type: matchWallet ? 'wallet' : 'personas',
                    })}
                </Typography>
            </Box>
            <Button variant="contained" color="primary" className={classes.button} onClick={onEnter}>
                {t('browser_action_enter_dashboard')}
            </Button>
        </Box>
    )
})
