import { HTMLProps, memo } from 'react'
import formatDateTime from 'date-fns/format'
import { useReverseAddress, useWeb3State } from '@masknet/web3-hooks-base'
import { AssetPreviewer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import type { SocialAccount } from '@masknet/web3-shared-base'
import { Card, Typography } from '@mui/material'
import { RSS3_DEFAULT_IMAGE } from '../../constants.js'
import { useI18N } from '../../locales/index.js'

export interface DonationCardProps extends Omit<HTMLProps<HTMLDivElement>, 'onSelect'> {
    donation: RSS3BaseAPI.Donation
    socialAccount: SocialAccount
    onSelect: (donation: RSS3BaseAPI.Donation) => void
}

const useStyles = makeStyles()((theme) => ({
    card: {
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        alignItems: 'stretch',
        padding: 3,
        cursor: 'pointer',
    },
    date: {
        color: theme.palette.maskColor.main,
        fontWeight: 400,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    info: {
        marginTop: 15,
        marginLeft: '12px',
        fontSize: 16,
    },
    infoRow: {
        marginBottom: 8,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    activity: {
        fontWeight: 400,
        fontColor: theme.palette.maskColor.main,
    },
    fontColor: {
        color: theme.palette.maskColor.primary,
    },
    tokenInfoColor: {
        color: theme.palette.maskColor.main,
    },
    img: {
        width: '126px !important',
        height: '126px !important',
        borderRadius: '8px',
        objectFit: 'cover',
        flexShrink: 0,
    },
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: 64,
        height: 64,
    },
}))

export const DonationCard = memo(({ donation, socialAccount, onSelect, className, ...rest }: DonationCardProps) => {
    const { classes, cx } = useStyles()
    const t = useI18N()
    const { value: domain } = useReverseAddress(socialAccount.pluginID, socialAccount.address)
    const { Others } = useWeb3State(socialAccount.pluginID)
    const reversedAddress =
        !domain || !Others?.formatDomainName
            ? Others?.formatAddress?.(socialAccount.address, 5) ?? socialAccount.address
            : Others.formatDomainName(domain)

    const date = donation.timestamp ? formatDateTime(new Date(donation.timestamp), 'MMM dd, yyyy') : '--'
    const action = donation.actions[0]

    return (
        <div onClick={() => onSelect(donation)} className={cx(classes.card, className)} {...rest}>
            <Card className={classes.img}>
                <AssetPreviewer
                    url={action.metadata?.logo || RSS3_DEFAULT_IMAGE}
                    classes={{
                        fallbackImage: classes.fallbackImage,
                    }}
                />
            </Card>

            <div className={classes.info}>
                <div className={classes.infoRow}>
                    <Typography className={classes.date} title={date}>
                        {date}
                    </Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.activity}>
                        <span className={classes.fontColor}>{reversedAddress}</span>{' '}
                        <span className={classes.fontColor}>{t.contributed()}</span>{' '}
                        <span className={classes.tokenInfoColor}>{action.metadata?.token.value_display}</span>
                        {action.metadata?.token.symbol ? (
                            <span className={classes.tokenInfoColor}>{`${action.metadata?.token.symbol} `}</span>
                        ) : null}
                        <span className={classes.fontColor}>{t.to()}</span>{' '}
                        <span className={classes.tokenInfoColor}>{action.metadata?.title}</span>
                    </Typography>
                </div>
            </div>
        </div>
    )
})
