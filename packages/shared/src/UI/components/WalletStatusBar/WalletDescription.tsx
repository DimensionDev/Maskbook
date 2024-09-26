import { makeStyles, LoadingBase } from '@masknet/theme'
import { memo } from 'react'
import { alpha, Box, Link, Typography } from '@mui/material'
import { CopyButton, WalletIcon } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { Trans } from '@lingui/macro'

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
        lineHeight: '18px',
    },
    address: {
        color: theme.palette.maskColor.second,
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
        lineHeight: '18px',
    },
    progress: {
        color: theme.palette.maskColor.warn,
    },
    linkIcon: {
        color: theme.palette.maskColor.second,
        cursor: 'pointer',
        height: 14,
    },
}))

export interface WalletDescriptionProps {
    onClick?: (ev: React.MouseEvent<HTMLDivElement>) => void
    pending?: boolean
    onPendingClick?: () => void
    providerIcon?: string
    networkIcon?: string
    iconFilterColor?: string
    name?: string
    address?: string
    formattedAddress?: string
    addressLink?: string
    verified?: boolean
}

export const WalletDescription = memo<WalletDescriptionProps>(
    ({
        onClick,
        providerIcon,
        networkIcon,
        iconFilterColor,
        name,
        address,
        formattedAddress,
        addressLink,
        onPendingClick,
        pending,
        verified,
    }) => {
        const { classes } = useStyles()

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
                        {verified ?
                            <Icons.Verification size={18} />
                        :   null}
                        {onPendingClick ?
                            <Icons.ArrowDrop />
                        :   null}
                    </Typography>
                    <Typography className={classes.address}>
                        <span>{formattedAddress}</span>
                        {address ?
                            <CopyButton size={14} className={classes.linkIcon} text={address} />
                        :   null}
                        <Link
                            href={addressLink}
                            target="_blank"
                            title="View on Explorer"
                            rel="noopener noreferrer"
                            onClick={(event) => {
                                event.stopPropagation()
                            }}
                            className={classes.linkIcon}>
                            <Icons.LinkOut size={14} className={classes.linkIcon} />
                        </Link>
                        {pending ?
                            <span
                                className={classes.pending}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onPendingClick?.()
                                }}>
                                <Trans>Pending</Trans>
                                <LoadingBase size={12} className={classes.progress} />
                            </span>
                        :   null}
                    </Typography>
                </Box>
            </Box>
        )
    },
)
