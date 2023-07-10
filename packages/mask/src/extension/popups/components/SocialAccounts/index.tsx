import { PopupModalRoutes, type EnhanceableSite, type ProfileAccount } from '@masknet/shared-base'
import { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { AccountAvatar } from '../../pages/Personas/components/AccountAvatar/index.js'
import { Icons } from '@masknet/icons'
import { ConnectSocialAccounts } from '../ConnectSocialAccounts/index.js'
import { useModalNavigate } from '../ActionModal/index.js'

const useStyles = makeStyles()((theme) => ({
    tips: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: '18px',
        marginTop: theme.spacing(2),
        color: theme.palette.maskColor.second,
    },
    accounts: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        columnGap: theme.spacing(1),
        rowGap: theme.spacing(1.5),
    },
    accountItem: {
        padding: theme.spacing(1.5),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 16,
        cursor: 'pointer',
        '&:hover': {
            background: theme.palette.maskColor.bottom,
            boxShadow: theme.palette.maskColor.bottomBg,
            backdropFilter: 'blur(8px)',
        },
    },
    identity: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
        marginTop: 6,
        maxWidth: 95,
    },
    connect: {
        borderRadius: 16,
        background: theme.palette.maskColor.bg,
        padding: theme.spacing(3.25, 0.5),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    avatar: {
        boxShadow: '0px 6px 12px 0px rgba(28, 104, 243, 0.20)',
    },
}))

export interface SocialAccountsProps {
    accounts: ProfileAccount[]
    networks: EnhanceableSite[]
    onConnect: (networkIdentifier: EnhanceableSite) => void
    onAccountClick: (account: ProfileAccount) => void
}

export const SocialAccounts = memo<SocialAccountsProps>(function SocialAccounts({
    accounts,
    networks,
    onConnect,
    onAccountClick,
}) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const modalNavigate = useModalNavigate()

    if (!accounts.length)
        return (
            <Box>
                <ConnectSocialAccounts networks={networks} onConnect={onConnect} />
                <Typography className={classes.tips}>{t('popups_connect_social_tips')}</Typography>
            </Box>
        )
    return (
        <Box className={classes.accounts}>
            {accounts.map((account, index) => (
                <Box className={classes.accountItem} key={index} onClick={() => onAccountClick(account)}>
                    <AccountAvatar
                        avatar={account.avatar}
                        network={account.identifier.network}
                        isValid={account.is_valid}
                        classes={{ avatar: classes.avatar }}
                    />
                    <Typography className={classes.identity}>@{account.identity}</Typography>
                </Box>
            ))}
            <Box className={classes.connect} onClick={() => modalNavigate(PopupModalRoutes.ConnectSocialAccount)}>
                <Icons.Connect size={16} />
                <Typography fontSize={12} fontWeight={700} lineHeight="18px">
                    {t('connect')}
                </Typography>
            </Box>
        </Box>
    )
})
