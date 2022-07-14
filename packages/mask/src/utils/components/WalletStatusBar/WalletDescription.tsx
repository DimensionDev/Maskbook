import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { alpha, Box, CircularProgress, Link, Typography } from '@mui/material'
import { WalletIcon } from '@masknet/shared'
import { ArrowDropIcon, LinkOutIcon } from '@masknet/icons'
import { useI18N } from '../../i18n-next-ui'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
        cursor: 'pointer',
    },
    description: {
        marginLeft: 10,
    },
    walletName: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
    },
    address: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        columnGap: 2,
    },
    pending: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        padding: '2px 4px',
        backgroundColor: alpha(theme.palette.maskColor.warn, 0.1),
        color: theme.palette.maskColor.warn,
        fontSize: 14,
        lineHeight: '18px',
    },
    progress: {
        color: theme.palette.maskColor.warn,
    },
    linkIcon: {
        width: 14,
        height: 14,
        fontSize: 14,
        color: theme.palette.maskColor.second,
        cursor: 'pointer',
    },
}))

interface WalletDescriptionProps {
    onClick?: (ev: React.MouseEvent<HTMLDivElement>) => void
    pending?: boolean
    onPendingClick?: () => void
    providerIcon?: URL
    networkIcon?: URL
    iconFilterColor?: string
    name?: string
    formattedAddress?: string
    addressLink?: string
}

export const WalletDescription = memo<WalletDescriptionProps>(
    ({
        onClick,
        providerIcon,
        networkIcon,
        iconFilterColor,
        name,
        formattedAddress,
        addressLink,
        onPendingClick,
        pending,
    }) => {
        const { classes } = useStyles()
        const { t } = useI18N()
        return (
            <Box onClick={onClick} className={classes.root}>
                <WalletIcon
                    size={30}
                    badgeSize={12}
                    mainIcon={providerIcon ?? networkIcon}
                    badgeIcon={providerIcon ? networkIcon : undefined}
                    iconFilterColor={iconFilterColor}
                />
                <Box className={classes.description}>
                    <Typography className={classes.walletName}>
                        <span>{name}</span>
                        <ArrowDropIcon />
                    </Typography>
                    <Typography className={classes.address}>
                        <span>{formattedAddress}</span>
                        <Link
                            href={addressLink}
                            target="_blank"
                            title="View on Explorer"
                            rel="noopener noreferrer"
                            className={classes.linkIcon}>
                            <LinkOutIcon className={classes.linkIcon} />
                        </Link>
                        {pending ? (
                            <span
                                className={classes.pending}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onPendingClick?.()
                                }}>
                                {t('recent_transaction_pending')}
                                <CircularProgress thickness={6} size={12} className={classes.progress} />
                            </span>
                        ) : null}
                    </Typography>
                </Box>
            </Box>
        )
    },
)
