import { memo, useCallback, useMemo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Button, Typography } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useAsyncFn } from 'react-use'
import { PersonaContext } from '../hooks/usePersonaContext.js'
import Services from '../../../../service.js'
import { LoadingButton } from '@mui/lab'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes, formatPersonaFingerprint, type PersonaInformation, NetworkPluginID } from '@masknet/shared-base'
import { PasswordField } from '../../../components/PasswordField/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { useWallets } from '@masknet/web3-hooks-base'
import type { Wallet } from '@masknet/web3-shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    content: {
        flex: 1,
        padding: '30px 16px 0 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 500,
        lineHeight: '24px',
        color: '#FF5F5F',
        marginTop: 12,
    },
    tips: {
        color: '#FF5555',
        fontSize: 13,
        lineHeight: '18px',
        wordBreak: 'break-all',
    },
    controller: {
        padding: '0 16px 16px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gap: 20,
    },
    button: {
        fontWeight: 600,
        padding: '10px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    password: {
        padding: '0 16px 20px 16px',
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: 20,
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        color: '#1C68F3',
        fontWeight: 500,
    },
    identifier: {
        fontSize: 12,
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-all',
    },
    personaContainer: {
        display: 'flex',
        backgroundColor: '#F7F9FA',
        borderRadius: 8,
        padding: '8px 16px',
        margin: '20px 0',
        width: '100%',
        marginBottom: 12,
    },
}))

const Logout = memo(() => {
    const { selectedPersona } = PersonaContext.useContainer()
    const navigate = useNavigate()
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const backupPassword = useMemo(() => {
        try {
            const password = localStorage.getItem('backupPassword')
            if (!password) return ''
            return atob(password)
        } catch {
            return ''
        }
    }, [])

    const [{ loading, error }, onLogout] = useAsyncFn(async () => {
        if (!selectedPersona) return
        await Services.Identity.logoutPersona(selectedPersona.identifier)
        const currentPersona = await Services.Settings.getCurrentPersonaIdentifier()
        if (!currentPersona) {
            const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()
            await Services.Settings.setCurrentPersonaIdentifier(lastCreatedPersona)
        }
        navigate(PopupRoutes.Personas, { replace: true })
    }, [selectedPersona, history])

    const manageWallets = useMemo(() => {
        return wallets.filter((x) => x.identifier?.toText() === selectedPersona?.identifier.toText())
    }, [wallets, selectedPersona])

    return (
        <LogoutUI
            manageWallets={manageWallets}
            selectedPersona={selectedPersona}
            backupPassword={backupPassword ?? ''}
            loading={loading}
            onLogout={onLogout}
            onCancel={() => navigate(-1)}
        />
    )
})

export interface LogoutUIProps {
    manageWallets: Wallet[]
    selectedPersona?: PersonaInformation
    backupPassword: string
    loading: boolean
    onCancel: () => void
    onLogout: () => void
}

export const LogoutUI = memo<LogoutUIProps>(
    ({ backupPassword, loading, onLogout, onCancel, selectedPersona, manageWallets }) => {
        const { t } = useI18N()
        const { classes } = useStyles()
        const [password, setPassword] = useState('')
        const [error, setError] = useState(false)

        useTitle(t('popups_log_out'))

        const onConfirm = useCallback(() => {
            if (!backupPassword || backupPassword === password) onLogout()
            else setError(true)
        }, [onLogout, backupPassword, password])

        return (
            <>
                <div className={classes.content}>
                    <Icons.CircleWarning size={64} />
                    <Typography className={classes.title}>{t('popups_persona_logout')}</Typography>
                    <div className={classes.personaContainer}>
                        <div className={classes.iconContainer}>
                            <Icons.Masks />
                        </div>
                        <div>
                            <Typography className={classes.name}>{selectedPersona?.nickname}</Typography>
                            <Typography className={classes.identifier}>
                                {formatPersonaFingerprint(selectedPersona?.identifier.rawPublicKey ?? '', 10)}
                            </Typography>
                        </div>
                    </div>
                    {manageWallets.map((x, index) => {
                        return (
                            <div className={classes.personaContainer} key={index}>
                                <div className={classes.iconContainer}>
                                    <Icons.SmartPay />
                                </div>
                                <div>
                                    <Typography className={classes.name}>{x.name}</Typography>
                                    <Typography className={classes.identifier}>
                                        {formatEthereumAddress(x.address, 4)}
                                    </Typography>
                                </div>
                            </div>
                        )
                    })}
                    <Typography className={classes.tips}>{t('popups_persona_disconnect_tip')}</Typography>
                    {manageWallets.length ? (
                        <Typography className={classes.tips} sx={{ my: 2 }}>
                            {t('popups_persona_disconnect_manage_wallet_warning', {
                                persona: selectedPersona?.nickname ?? '',
                                addresses: manageWallets.map((x) => formatEthereumAddress(x.address, 4)).join(','),
                            })}
                        </Typography>
                    ) : null}
                </div>

                {backupPassword ? (
                    <div className={classes.password}>
                        <PasswordField
                            placeholder={t('popups_backup_password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={error}
                            helperText={error ? t('popups_password_do_not_match') : ''}
                        />
                    </div>
                ) : null}
                <div className={classes.controller}>
                    <Button
                        variant="contained"
                        className={classes.button}
                        onClick={onCancel}
                        style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}>
                        {t('cancel')}
                    </Button>
                    <LoadingButton
                        loading={loading}
                        variant="contained"
                        className={classes.button}
                        color="error"
                        style={{ backgroundColor: '#ff5555' }}
                        onClick={onConfirm}>
                        {t('popups_persona_logout')}
                    </LoadingButton>
                </div>
            </>
        )
    },
)

export default Logout
