import { Icons } from '@masknet/icons'
import { LoadingStatus, SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { SOCIAL_MEDIA_NAME } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { memo } from 'react'
import { Trans } from 'react-i18next'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/ui.js'
import { useMaskSharedTrans } from '../../../utils/i18n-next-ui.js'
import { BindingDialog, type BindingDialogProps } from './BindingDialog.js'

const useStyles = makeStyles()((theme) => {
    return {
        main: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: theme.spacing(3),
            height: '100%',
            boxSizing: 'border-box',
        },
        icon: {
            marginTop: theme.spacing(3),
        },
        title: {
            fontSize: 18,
            margin: theme.spacing(1.5),
            fontWeight: 700,
        },
        loadingBox: {
            width: 320,
            height: 130,
            padding: theme.spacing(2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        text: {
            fontSize: 16,
            textAlign: 'center',
        },
    }
})

interface Props extends BindingDialogProps {
    currentUserId?: string
    expectAccount: string
    /** Loading current userId */
    loading?: boolean
    /** Persona is verified with expectAccount */
    connected?: boolean
    onConfirm?: () => void
}

export const AccountConnectStatus = memo<Props>(function AccountConnectStatus({
    expectAccount,
    currentUserId,
    loading,
    connected,
    onConfirm,
    ...rest
}) {
    const { classes } = useStyles()
    const { t } = useMaskSharedTrans()
    const site = activatedSiteAdaptorUI!.networkIdentifier
    const siteName = SOCIAL_MEDIA_NAME[site] || ''
    const Icon = SOCIAL_MEDIA_ROUND_ICON_MAPPING[site] || Icons.Globe
    return (
        <BindingDialog {...rest}>
            <div className={classes.main}>
                <Icon size={48} className={classes.icon} />
                <Typography className={classes.title}>{t('connect_persona')}</Typography>
                {loading ? (
                    <div className={classes.loadingBox}>
                        <LoadingStatus omitText />
                    </div>
                ) : connected ? (
                    <>
                        <Typography className={classes.text}>
                            <Trans
                                i18nKey="connected_already"
                                values={{
                                    account: expectAccount,
                                }}
                                components={{
                                    bold: <b />,
                                }}
                            />
                        </Typography>
                        <Typography className={classes.text} mt="1.5em">
                            {t('switch_for_more_connections')}
                        </Typography>
                        <Box mt="auto" width="100%">
                            <Button fullWidth onClick={onConfirm}>
                                {t('ok')}
                            </Button>
                        </Box>
                    </>
                ) : currentUserId ? (
                    <>
                        <Typography className={classes.text}>{t('not_current_account')}</Typography>
                        <Typography className={classes.text} mt="1.5em">
                            <Trans
                                i18nKey="request_to_switch_account"
                                values={{
                                    account: expectAccount,
                                }}
                                components={{
                                    bold: <b />,
                                }}
                            />
                        </Typography>
                    </>
                ) : (
                    <Typography className={classes.text}>{t('request_to_login', { siteName })}</Typography>
                )}
            </div>
        </BindingDialog>
    )
})
