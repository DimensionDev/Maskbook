import urlcat from 'urlcat'
import { memo, useCallback, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { Box, Typography, useTheme } from '@mui/material'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import Services from '#services'
import { PasswordField } from '../../../components/PasswordField/index.js'
import { PopupHomeTabType } from '@masknet/shared'
import { Trans } from '@lingui/macro'

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

const Unlock = memo(function Unlock() {
    const { classes } = useStyles()
    const [password, setPassword] = useState('')
    const theme = useTheme()
    const navigate = useNavigate()
    const [params] = useSearchParams()

    const [{ value: verified, loading }, handleUnlock] = useAsyncFn(async () => {
        const from = params.get('from')
        const close_after_unlock = params.get('close_after_unlock')
        const verified = await Services.Wallet.unlockWallet(password)

        if (verified) {
            if (close_after_unlock && !from) {
                await Services.Helper.removePopupWindow()
            } else if (from) {
                const path = urlcat(from, {
                    tab: from === PopupRoutes.Personas ? PopupHomeTabType.ConnectedWallets : undefined,
                })
                navigate(path, { replace: true })
            }
        }
        return verified
    }, [password, params])

    const navigateToResetWallet = useCallback(() => {
        navigate({ pathname: PopupRoutes.ResetWallet })
    }, [])

    return (
        <Box className={classes.container}>
            <Box className={classes.content}>
                <Box className={classes.titleWrapper}>
                    <Typography className={classes.title}>
                        <Trans>Welcome Back</Trans>
                    </Typography>
                </Box>
                <Box className={classes.inputWrapper}>
                    <PasswordField
                        placeholder="Password"
                        value={password}
                        autoFocus
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') handleUnlock()
                        }}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {verified === false ?
                        <Typography fontSize={14} color={theme.palette.maskColor.danger} marginTop="12px">
                            <Trans>Incorrect password</Trans>
                        </Typography>
                    :   null}
                </Box>

                <LoadingButton
                    loading={loading}
                    fullWidth
                    variant="contained"
                    disabled={!password || loading}
                    onClick={handleUnlock}>
                    <Trans>Unlock</Trans>
                </LoadingButton>

                <Typography
                    color={theme.palette.maskColor.main}
                    marginTop="16px"
                    onClick={navigateToResetWallet}
                    className={classes.pointer}
                    fontSize={14}
                    textAlign="center"
                    fontWeight={700}>
                    <Trans>Forgot payment password?</Trans>
                </Typography>
            </Box>
        </Box>
    )
})

export default Unlock
