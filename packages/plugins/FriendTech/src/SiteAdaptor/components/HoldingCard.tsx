import { Icons } from '@masknet/icons'
import { CopyButton, FormattedBalance, Image, ProgressiveText, ReversedAddress } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useEverSeen } from '@masknet/shared-base-ui'
import { ShadowRootTooltip, TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import { type FriendTech as FT } from '@masknet/web3-providers/types'
import { formatBalance, isSameAddress } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Link, Skeleton, Typography } from '@mui/material'
import { memo, type HTMLProps } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import urlcat from 'urlcat'
import { RoutePaths } from '../../constants.js'
import { useUser } from '../hooks/useUser.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    avatar: {
        borderRadius: '50%',
    },
    name: {
        fontSize: 12,
        maxWidth: '90%',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    address: {
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    link: {
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.maskColor.main,
    },
    keyPrice: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
    },
    holdingCard: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        borderRadius: 8,
        padding: theme.spacing(1.5),
        cursor: 'pointer',
    },
    rank: {
        fontSize: 12,
        color: theme.palette.maskColor.main,
        fontWeight: 700,
    },
    holding: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    holderMeta: {
        marginTop: theme.spacing(1),
    },
    holderMetaItem: {
        display: 'flex',
        justifyContent: 'space-between',
        '&:not(:first-of-type)': {
            marginTop: 8,
        },
    },
    holderMetaLabel: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
    },
    holderMetaValue: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    holding: FT.Holder
    holder: string
}

export const HoldingCard = memo(function HoldingCard({ holding, holder, className, ...rest }: Props) {
    const { classes, cx } = useStyles()
    const Utils = useWeb3Utils(NetworkPluginID.PLUGIN_EVM)
    const [seen, ref] = useEverSeen()
    const [params] = useSearchParams()

    // Disable loading with empty string until component appearances.
    const { data: user, isLoading: loading } = useUser(seen ? holding.address : '')
    const navigate = useNavigate()

    return (
        <div
            ref={ref}
            className={cx(classes.holdingCard, className)}
            onClick={() => {
                if (isSameAddress(params.get('address'), holding.address)) return
                navigate(urlcat(RoutePaths.Detail, { address: holding.address, title: holding.twitterName }))
            }}
            {...rest}>
            <ProgressiveText className={classes.rank} loading={loading} skeletonWidth={50}>
                # {user?.rank}
            </ProgressiveText>
            <div className={classes.holding}>
                <Image
                    className={classes.avatar}
                    classes={{ failed: classes.avatar }}
                    src={holding.twitterPfpUrl}
                    size={40}
                />
                <TextOverflowTooltip as={ShadowRootTooltip} title={holding.twitterName}>
                    <Typography className={classes.name} mt={1} fontWeight={700}>
                        @{holding.twitterUsername}
                    </Typography>
                </TextOverflowTooltip>
                <div className={classes.address}>
                    <ReversedAddress address={holding.address} fontSize={12} />
                    <CopyButton text={holding.address} size={16} />
                    <Link
                        className={classes.link}
                        href={Utils.explorerResolver.addressLink(ChainId.Base, holding.address) ?? ''}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Icons.LinkOut size={16} />
                    </Link>
                </div>
            </div>
            <div className={classes.holderMeta}>
                <div className={classes.holderMetaItem}>
                    <Typography className={classes.holderMetaLabel}>
                        <Trans>Keys</Trans>
                    </Typography>
                    <Typography className={classes.holderMetaValue}>{holding.balance}</Typography>
                </div>
                <div className={classes.holderMetaItem}>
                    <Typography className={classes.holderMetaLabel}>
                        <Trans>Value</Trans>
                    </Typography>
                    <ProgressiveText
                        className={cx(classes.keyPrice, classes.holderMetaValue)}
                        loading={loading}
                        skeletonWidth={80}>
                        <Icons.ETHSymbol size={18} />
                        <FormattedBalance value={user?.displayPrice} decimals={18} formatter={formatBalance} />
                    </ProgressiveText>
                </div>
            </div>
        </div>
    )
})

export const HoldingCardSkeleton = memo(function HoldingCardSkeleton({
    className,
    ...rest
}: HTMLProps<HTMLDivElement>) {
    const { classes, cx } = useStyles()

    return (
        <div className={cx(classes.holdingCard, className)} {...rest}>
            <Skeleton className={classes.rank} width={50} />
            <div className={classes.holding}>
                <Skeleton variant="circular" className={classes.avatar} width={40} height={40} />
                <Skeleton variant="text" style={{ marginTop: 8 }} width={50} />
                <div className={classes.address}>
                    <Skeleton variant="text" width={80} />
                </div>
            </div>
            <div className={classes.holderMeta}>
                <div className={classes.holderMetaItem}>
                    <Typography className={classes.holderMetaLabel}>
                        <Trans>Keys</Trans>
                    </Typography>
                    <Skeleton className={classes.holderMetaValue} width={30} />
                </div>
                <div className={classes.holderMetaItem}>
                    <Typography className={classes.holderMetaLabel}>
                        <Trans>Value</Trans>
                    </Typography>
                    <Typography component="div" className={cx(classes.keyPrice, classes.holderMetaValue)}>
                        <Skeleton width={60} />
                    </Typography>
                </div>
            </div>
        </div>
    )
})
