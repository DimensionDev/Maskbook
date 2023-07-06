import { memo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate, useLocation } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, useTheme } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { PopupRoutes } from '@masknet/shared-base'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'
import { PasswordField } from '../../../components/PasswordField/index.js'
import { Navigator } from '../../../components/Navigator/index.js'
import { LoadingButton } from '@mui/lab'
import { Trans } from 'react-i18next'
import { ResetWalletModal } from '../../../modals/modals.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.maskColor.secondaryBottom,
    },
    content: {
        padding: 16,
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    titleWrapper: {
        paddingTop: 8,
        paddingBottom: 12,
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        lineHeight: '120%',
        fontStyle: 'normal',
        fontWeight: 700,
        marginBottom: 12,
    },
    inputWrapper: {
        marginTop: 16,
        height: 152,
        width: '100%',
    },
    strong: {
        color: theme.palette.maskColor.main,
    },
    pointer: {
        cursor: 'pointer',
    },
}))

const Unlock = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const location = useLocation()
    const [password, setPassword] = useState('')
    const theme = useTheme()
    const navigate = useNavigate()

    const [{ value: verified, loading }, handleUnlock] = useAsyncFn(async () => {
        const verified = await WalletRPC.unlockWallet(password)
        const from = new URLSearchParams(location.search).get('from')
        if (verified) navigate({ pathname: from ?? PopupRoutes.Wallet, search: location.search }, { replace: true })
        return verified
    }, [password, location.search])

    return (
        <Box className={classes.container}>
            <Box className={classes.content}>
                <Box className={classes.titleWrapper}>
                    <Typography className={classes.title}>{t('welcome_back')}</Typography>
                </Box>
                <Box className={classes.inputWrapper}>
                    <PasswordField
                        placeholder="Password"
                        value={password}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {verified === false ? (
                        <Typography fontSize={14} color={theme.palette.maskColor.danger} marginTop="12px">
                            {t('popups_wallet_unlock_error_password')}
                        </Typography>
                    ) : null}
                </Box>

                <LoadingButton
                    loading={loading}
                    fullWidth
                    variant="contained"
                    disabled={!password}
                    onClick={handleUnlock}>
                    {t('unlock')}
                </LoadingButton>

                <Typography
                    color={theme.palette.maskColor.third}
                    marginTop="16px"
                    onClick={() => ResetWalletModal.open({})}
                    className={classes.pointer}
                    fontSize={14}
                    textAlign="center"
                    fontWeight={400}>
                    <Trans
                        i18nKey="popups_wallet_reset_tips"
                        components={{ strong: <strong className={classes.strong} /> }}
                    />
                </Typography>
            </Box>
            <Navigator />
        </Box>
    )
})

export default Unlock
