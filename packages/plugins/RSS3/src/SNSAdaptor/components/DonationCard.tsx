import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import type { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import classnames from 'classnames'
import formatDateTime from 'date-fns/format'
import type { HTMLProps } from 'react'
import { RSS3_DEFAULT_IMAGE } from '../../constants'
import { useI18N } from '../../locales'

export interface DonationCardProps extends HTMLProps<HTMLDivElement> {
    donation: RSS3BaseAPI.Collection
    address: SocialAddress<NetworkPluginID>
    onSelect: () => void
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
        fontSize: 14,
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
        fontSize: 14,
        fontWeight: 400,
        fontColor: theme.palette.maskColor.main,
    },
    fontColor: {
        color: theme.palette.maskColor.primary,
    },
}))

export const DonationCard = ({ donation, address, onSelect, className, ...rest }: DonationCardProps) => {
    const { classes } = useStyles()
    const t = useI18N()
    const { value: domain } = useReverseAddress(address.networkSupporterPluginID, address.address)
    const { Others } = useWeb3State(address.networkSupporterPluginID)
    const reversedAddress =
        !domain || !Others?.formatDomainName
            ? Others?.formatAddress?.(address.address, 5) ?? address.address
            : Others.formatDomainName(domain)

    const date = donation.timestamp ? formatDateTime(new Date(donation.timestamp), 'MMM dd, yyyy') : '--'

    return (
        <div onClick={onSelect} className={classnames(classes.card, className)} {...rest}>
            <img
                className={classes.cover}
                src={donation.imageURL || RSS3_DEFAULT_IMAGE}
                alt={donation.title || t.inactive_project()}
            />
            <div className={classes.info}>
                <div className={classes.infoRow}>
                    <Typography className={classes.date} title={date}>
                        {date}
                    </Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.activity}>
                        <span className={classes.fontColor}>{reversedAddress}</span> {t.contributed()}{' '}
                        {donation.tokenAmount}
                        {donation.tokenSymbol ?? 'ETH'} <span className={classes.fontColor}>{t.to()}</span>{' '}
                        {donation.title}
                    </Typography>
                </div>
            </div>
        </div>
    )
}
