import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import type { Account } from '../type'
import { AccountAvatar } from '../components/AccountAvatar'
import { Button, Typography } from '@mui/material'
import { useI18N } from '../../../../../utils'
import { LoadingButton } from '@mui/lab'

const useStyles = makeStyles()(() => ({
    container: {
        padding: '8px 16px 0px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        rowGap: 12,
        backgroundColor: '#F7F9FA',
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: '#07101B',
    },
    warning: {
        padding: '6px 12px',
        background: 'rgba(255, 185, 21, 0.1)',
        color: '#FFB915',
        fontSize: 12,
        lineHeight: '16px',
    },
    controller: {
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,

        display: 'flex',
        justifyContent: 'space-between',
        columnGap: 12,
    },
    button: {
        padding: '10px 0',
        display: 'flex',
        justifyContent: 'center',
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 600,
        color: '#ffffff',
        borderRadius: 99,
        flex: 1,
    },
}))

interface AccountDetailUIProps {
    account: Account
    personaName?: string
    onVerify: () => void
    onDisconnect: () => void
    disconnectLoading: boolean
}

export const AccountDetailUI = memo<AccountDetailUIProps>(
    ({ account, personaName, onVerify, onDisconnect, disconnectLoading }) => {
        const { t } = useI18N()
        const { classes } = useStyles()

        return (
            <div className={classes.container}>
                <AccountAvatar
                    avatar={account.avatar}
                    network={account.identifier.network}
                    isValid={account.is_valid}
                />
                <Typography className={classes.name}>{account.identifier.userId}</Typography>
                <Typography className={classes.warning}>
                    {account.is_valid
                        ? t('popups_disconnect_warning_alert', {
                              account: account.identifier.userId,
                          })
                        : t('popups_verify_warning_alert', {
                              account: account.identifier.userId,
                          })}
                </Typography>
                <div className={classes.controller}>
                    {account.is_valid ? (
                        <LoadingButton
                            className={classes.button}
                            style={{ background: '#FFB915' }}
                            loading={disconnectLoading}
                            onClick={onDisconnect}>
                            {t('popups_persona_disconnect')}
                        </LoadingButton>
                    ) : (
                        <>
                            <LoadingButton
                                className={classes.button}
                                style={{ background: '#FFB915' }}
                                loading={disconnectLoading}
                                onClick={onDisconnect}>
                                {t('popups_persona_disconnect')}
                            </LoadingButton>
                            <Button
                                className={classes.button}
                                style={{ background: '#1C68F3' }}
                                onClick={() => onVerify()}>
                                {t('popups_verify_account')}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        )
    },
)
