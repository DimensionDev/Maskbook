import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { LoadingButton } from '@mui/lab'
import { Button, Typography } from '@mui/material'
import type { Account } from '../type.js'
import { AccountAvatar } from '../components/AccountAvatar/index.js'
import { useI18N } from '../../../../../utils/index.js'
import { Trans } from 'react-i18next'
import { EnhanceableSite } from '@masknet/shared-base'

const useStyles = makeStyles()(() => ({
    container: {
        padding: '8px 16px 0 16px',
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
    tip: {
        fontSize: 12,
        lineHeight: '16px',
        marginTop: 16,
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
    isSupportNextDotID: boolean
}

export const AccountDetailUI = memo<AccountDetailUIProps>(
    ({ account, personaName, onVerify, onDisconnect, disconnectLoading, isSupportNextDotID }) => {
        const { t } = useI18N()
        const { classes } = useStyles()

        return (
            <div className={classes.container}>
                <AccountAvatar
                    avatar={account.avatar}
                    network={account.identifier.network}
                    isValid={account.is_valid}
                />
                <Typography className={classes.name}>@{account.identifier.userId}</Typography>
                <Typography className={classes.warning}>
                    {account.is_valid || account.identifier.network !== EnhanceableSite.Twitter ? (
                        <Trans
                            i18nKey="popups_verify_warning_alert"
                            components={{ strong: <strong /> }}
                            values={{ account: account.identifier.userId, persona: personaName }}
                        />
                    ) : (
                        <Trans
                            i18nKey="popups_disconnect_warning_alert"
                            components={{ strong: <strong /> }}
                            values={{ account: account.identifier.userId }}
                        />
                    )}

                    {account.identifier.network !== EnhanceableSite.Twitter ? (
                        <Typography className={classes.tip}>{t('popups_disconnect_other_warning_alert')}</Typography>
                    ) : null}
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
                            {isSupportNextDotID ? (
                                <Button
                                    className={classes.button}
                                    style={{ background: '#1C68F3' }}
                                    onClick={() => onVerify()}>
                                    {t('popups_verify_account')}
                                </Button>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        )
    },
)
