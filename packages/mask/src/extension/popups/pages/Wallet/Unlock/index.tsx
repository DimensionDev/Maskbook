import { memo, useCallback, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { Box, Typography, useTheme } from '@mui/material'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../../utils/index.js'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'
import { PasswordField } from '../../../components/PasswordField/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.maskColor.secondaryBottom,
    },
    content: {
        padding: '0px 16px',
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    titleWrapper: {
        paddingTop: 8,
        height: 100,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
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
        paddingTop: 18,
        height: 192,
        width: '100%',
    },
    pointer: {
        cursor: 'pointer',
    },
}))

const Unlock = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [password, setPassword] = useState('')
    const theme = useTheme()
    const navigate = useNavigate()
    const [params] = useSearchParams()

    const [{ value: verified, loading }, handleUnlock] = useAsyncFn(async () => {
        const from = params.get('from')

        const verified = await WalletRPC.unlockWallet(password)

        if (verified) navigate({ pathname: from || PopupRoutes.Wallet }, { replace: true })
        return verified
    }, [password, params])

    const navigateToResetWallet = useCallback(() => {
        navigate({ pathname: PopupRoutes.ResetWallet })
    }, [])

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
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') handleUnlock()
                        }}
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
                    disabled={!password || loading}
                    onClick={handleUnlock}>
                    {t('unlock')}
                </LoadingButton>

                <Typography
                    color={theme.palette.maskColor.main}
                    marginTop="16px"
                    onClick={navigateToResetWallet}
                    className={classes.pointer}
                    fontSize={14}
                    textAlign="center"
                    fontWeight={700}>
                    {t('popups_wallet_reset_tips')}
                </Typography>
            </Box>
        </Box>
    )
})

export default Unlock
