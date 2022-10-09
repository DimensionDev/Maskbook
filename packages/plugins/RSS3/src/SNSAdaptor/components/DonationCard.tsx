import { HTMLProps, memo } from 'react'
import classnames from 'classnames'
import formatDateTime from 'date-fns/format'
import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { Card, Typography } from '@mui/material'
import { RSS3_DEFAULT_IMAGE } from '../../constants.js'
import { useI18N } from '../../locales/index.js'

export interface DonationCardProps extends Omit<HTMLProps<HTMLDivElement>, 'onSelect'> {
    donation: RSS3BaseAPI.Donation
    socialAddress: SocialAddress<NetworkPluginID>
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
    cover: {
        flexShrink: 1,
        height: 126,
        width: 126,
        borderRadius: 8,
        objectFit: 'cover',
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

export const DonationCard = memo(({ donation, socialAddress, onSelect, className, ...rest }: DonationCardProps) => {
    const { classes } = useStyles()
    const t = useI18N()
    const { value: domain } = useReverseAddress(socialAddress.networkSupporterPluginID, socialAddress.address)
    const { Others } = useWeb3State(socialAddress.networkSupporterPluginID)
    const reversedAddress =
        !domain || !Others?.formatDomainName
            ? Others?.formatAddress?.(socialAddress.address, 5) ?? socialAddress.address
            : Others.formatDomainName(domain)

    const date = donation.timestamp ? formatDateTime(new Date(donation.timestamp), 'MMM dd, yyyy') : '--'
    const action = donation.actions[0]

    return (
        <div onClick={() => onSelect(donation)} className={classnames(classes.card, className)} {...rest}>
            <Card className={classes.img}>
                <NFTCardStyledAssetPlayer
                    url={action.metadata?.logo || RSS3_DEFAULT_IMAGE}
                    classes={{
                        fallbackImage: classes.fallbackImage,
                        wrapper: classes.img,
                        iframe: classes.img,
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
