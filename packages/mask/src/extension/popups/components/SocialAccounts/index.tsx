import { SOCIAL_MEDIA_NAME, type EnhanceableSite } from '@masknet/shared-base'
import { memo } from 'react'
import type { Account } from '../../pages/Personas/type.js'
import { Box, Typography } from '@mui/material'
import { SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { AccountAvatar } from '../../pages/Personas/components/AccountAvatar/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing(2),
    },
    item: {
        background: theme.palette.maskColor.bg,
        padding: theme.spacing(1.5),
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
    },
    networkIcon: {
        width: 24,
        height: 24,
        '& > svg': {
            borderRadius: 99,
        },
    },
    network: {
        marginLeft: 8,
        color: theme.palette.maskColor.second,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
    },
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
}))

export interface SocialAccountsProps {
    accounts: Account[]
    networks: EnhanceableSite[]
    onConnect: (networkIdentifier: EnhanceableSite) => void
}

export const SocialAccounts = memo<SocialAccountsProps>(function SocialAccounts({ accounts, networks, onConnect }) {
    const { t } = useI18N()
    const { classes } = useStyles()
    if (!accounts.length)
        return (
            <Box>
                <Box className={classes.container}>
                    {networks.map((networkIdentifier) => {
                        const Icon = SOCIAL_MEDIA_ROUND_ICON_MAPPING[networkIdentifier]

                        return (
                            <Box
                                className={classes.item}
                                key={networkIdentifier}
                                onClick={() => onConnect(networkIdentifier)}>
                                <div className={classes.networkIcon}>{Icon ? <Icon size={24} /> : null}</div>
                                <Typography className={classes.network}>
                                    {SOCIAL_MEDIA_NAME[networkIdentifier]}
                                </Typography>
                            </Box>
                        )
                    })}
                </Box>
                <Typography className={classes.tips}>{t('popups_connect_social_tips')}</Typography>
            </Box>
        )
    return (
        <Box className={classes.accounts}>
            {accounts.map((account, index) => (
                <Box className={classes.accountItem} key={index}>
                    <AccountAvatar
                        avatar={account.avatar}
                        network={account.identifier.network}
                        isValid={account.is_valid}
                    />
                    <Typography className={classes.identity}>@{account.identity}</Typography>
                </Box>
            ))}
            <Box />
        </Box>
    )
})
