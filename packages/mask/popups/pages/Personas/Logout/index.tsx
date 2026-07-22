import Services from '#services'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { PersonaContext } from '@masknet/shared'
import { PopupRoutes, type PersonaInformation } from '@masknet/shared-base'
import { useContainer } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { Box, Button, Typography, useTheme } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { UserContext } from '../../../../shared-ui/index.js'
import { BottomController } from '../../../components/BottomController/index.js'
import { PasswordField } from '../../../components/PasswordField/index.js'
import { PersonaAvatar } from '../../../components/PersonaAvatar/index.js'
import { useTitle } from '../../../hooks/index.js'

const useStyles = makeStyles()((theme, _, refs) => ({
    infoBox: {
        background: theme.vars.palette.maskColor.modalTitleBg,
        borderRadius: 8,
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        columnGap: theme.spacing(1),
    },
    tips: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.vars.palette.maskColor.danger,
        margin: theme.spacing(0.5, 0),
        wordWrap: 'break-word',
    },
}))

export const Component = memo(function Logout() {
    const { currentPersona } = PersonaContext.useContainer()
    const navigate = useNavigate()

    const { Provider } = useWeb3State()

    const { user } = useContainer(UserContext)
    const { showSnackbar } = usePopupCustomSnackbar()

    const [{ loading }, onLogout] = useAsyncFn(async () => {
        try {
            if (!currentPersona) return
            await Services.Identity.logoutPersona(currentPersona.identifier)
            const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
            if (!currentPersonaIdentifier) {
                const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()
                await Services.Settings.setCurrentPersonaIdentifier(lastCreatedPersona)
            }

            showSnackbar(<Trans>Logout successfully</Trans>)
            navigate(PopupRoutes.Personas, { replace: true })
        } catch {
            showSnackbar(<Trans>Logout failed</Trans>, { variant: 'error' })
        }
    }, [currentPersona, Provider])

    return (
        <LogoutUI
            currentPersona={currentPersona}
            backupPassword={user.backupPassword ?? ''}
            onLogout={onLogout}
            loading={loading}
            onCancel={() => navigate(-1)}
        />
    )
})

interface LogoutUIProps {
    currentPersona?: PersonaInformation
    backupPassword: string
    loading: boolean
    onCancel: () => void
    onLogout: () => void
}

const LogoutUI = memo<LogoutUIProps>(function LogoutUI({
    backupPassword,
    onLogout,
    onCancel,
    currentPersona,
    loading,
}) {
    const { _ } = useLingui()
    const theme = useTheme()
    const { classes } = useStyles()
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    useTitle(_(msg`Log out`))

    const onConfirm = useCallback(async () => {
        if (backupPassword && backupPassword !== password) {
            setError(true)
            return
        }

        onLogout()
        return
    }, [onLogout, backupPassword, password])

    const disabled = useMemo(() => {
        if (error || loading) return true

        if (backupPassword) return !password.length
        return false
    }, [backupPassword, error, password, loading])

    const passwordField = useMemo(() => {
        if (backupPassword) {
            return (
                <PasswordField
                    placeholder={_(msg`Please enter your backup password.`)}
                    value={password}
                    onChange={(e) => {
                        if (error) setError(false)
                        setPassword(e.target.value)
                    }}
                    error={error}
                    helperText={error ? <Trans>Incorrect password</Trans> : ''}
                />
            )
        }

        return
    }, [backupPassword, password, error, _])

    return (
        <Box sx={{ flex: 1, maxHeight: '544px', overflow: 'auto' }} data-hide-scrollbar>
            <Box sx={{ p: 2, pb: 11, display: 'flex', gap: 1.5, flexDirection: 'column' }}>
                <Box className={classes.infoBox}>
                    <PersonaAvatar
                        size={30}
                        avatar={currentPersona?.avatar}
                        pubkey={currentPersona?.identifier.publicKeyAsHex || ''}
                    />
                    <Box>
                        <Typography sx={{ fontWeight: 700 }}>{currentPersona?.nickname}</Typography>
                        <Typography
                            sx={{ color: theme.vars.palette.maskColor.third, fontSize: 10, lineHeight: '10px' }}>
                            {currentPersona?.identifier.rawPublicKey}
                        </Typography>
                    </Box>
                </Box>
                <Typography className={classes.tips}>
                    <Trans>
                        After logging out, your associated social accounts will no longer decrypt old encrypted
                        messages. If you need to use your account again, you can recover your account with your
                        identity, private key, local or cloud backup.
                    </Trans>
                </Typography>
                {passwordField}
            </Box>
            <BottomController>
                <Button variant="outlined" fullWidth onClick={onCancel}>
                    <Trans>Cancel</Trans>
                </Button>
                <ActionButton
                    variant="contained"
                    color={backupPassword ? 'error' : 'primary'}
                    fullWidth
                    onClick={onConfirm}
                    disabled={disabled}>
                    {backupPassword ?
                        <Trans>Log out</Trans>
                    :   <Trans>Backup</Trans>}
                </ActionButton>
            </BottomController>
        </Box>
    )
})
