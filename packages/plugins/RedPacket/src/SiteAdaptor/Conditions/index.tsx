import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { WalletRelatedTypes } from '@masknet/plugin-redpacket'
import { TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { MaskColors, makeStyles } from '@masknet/theme'
import { FireflyTwitter } from '@masknet/web3-providers'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { isZero } from '@masknet/web3-shared-base'
import { Box, IconButton, Link, Typography, type BoxProps } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { memo } from 'react'
import { formatTokenAmount } from '../helpers/formatTokenAmount.js'

const useStyles = makeStyles<void, 'assetName'>()((theme, _, refs) => ({
    box: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        color: MaskColors.dark.text.primary,
        borderRadius: 8,
        padding: theme.spacing(1.5),
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        fontSize: 20,
        height: 20,
        fontWeight: 700,
        paddingBottom: theme.spacing(1),
        lineHeight: '120%',
        display: 'flex',
        alignItems: 'center',
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            paddingBottom: theme.spacing(1),
            fontSize: 15,
        },
    },
    closeButton: {
        position: 'absolute',
        color: theme.palette.common.white,
        padding: 0,
        right: -15,
        top: -15,
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
    },
    assets: {
        display: 'flex',
        gap: theme.spacing(1.5),
        flexFlow: 'row wrap',
    },
    collections: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gap: theme.spacing(1),
        [`& .${refs.assetName}`]: {
            lineHeight: '18px',
        },
    },
    asset: {
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        gap: theme.spacing(1),
    },
    assetName: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: '20px',
        color: theme.palette.common.white,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    tokenIcon: {
        width: 24,
        height: 24,
        marginRight: '0px !important',
    },
    results: {
        position: 'absolute',
        left: 12,
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(255, 53, 69, 0.2)',
        borderRadius: 4,
        padding: 6,
        '&:empty': {
            display: 'none',
        },
    },
    unsatisfied: {
        color: theme.palette.maskColor.white,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
    },
}))

interface Props extends BoxProps {
    statusList: FireflyRedPacketAPI.ClaimStrategyStatus[]
    onClose?(): void
}

const StrategyType = FireflyRedPacketAPI.StrategyType
const PlatformType = FireflyRedPacketAPI.PlatformType

export const Conditions = memo(function Conditions({ onClose, statusList, ...props }: Props) {
    const { classes, cx } = useStyles()
    const tokenPayloads = statusList.find((x) => x.type === StrategyType.tokens)?.payload
    const tokenPayload = tokenPayloads?.[0]
    const quantity = tokenPayload ? formatTokenAmount(tokenPayload.amount, tokenPayload.decimals) : ''

    const collectionPayloads = statusList.find((x) => x.type === StrategyType.nftOwned)?.payload
    const walletUnsatisfied = statusList
        .filter((x) => WalletRelatedTypes.includes(x.type))
        .some((x) => (typeof x.result === 'boolean' ? !x.result : !x.result.hasPassed))
    const followStatus = statusList.find((x) => x.type === StrategyType.profileFollow)
    const followPayload = followStatus?.payload.find((x) => x.platform === PlatformType.twitter)

    const { data: twitterHandle } = useQuery({
        queryKey: ['twitter-user', 'by-profile-id', followPayload?.profileId],
        queryFn: () => (followPayload?.profileId ? FireflyTwitter.getUserInfoById(followPayload?.profileId) : null),
        select: (data) => data?.legacy.screen_name,
    })

    return (
        <Box {...props} className={cx(classes.box, props.className)}>
            <Typography variant="h2" className={classes.header}>
                <Trans>Who can claim?</Trans>
            </Typography>
            <div className={classes.content}>
                {followPayload ?
                    <div className={classes.section}>
                        <Typography className={classes.sectionTitle}>
                            {twitterHandle ?
                                <Trans>
                                    You need to follow{' '}
                                    <Link href={`https://twitter.com/${twitterHandle}`} target="_blank" color="inherit">
                                        @{twitterHandle}
                                    </Link>
                                </Trans>
                            :   <Trans>You need to follow the creator of the lucky drop.</Trans>}
                        </Typography>
                    </div>
                :   null}
                {tokenPayloads?.length ?
                    <div className={classes.section}>
                        <Typography className={classes.sectionTitle}>
                            {isZero(quantity || 0) ?
                                <Trans>You need to hold any of the following tokens.</Trans>
                            :   <Trans>You need to hold at least {quantity} of any of the following tokens.</Trans>}
                        </Typography>

                        <div className={classes.assets}>
                            {tokenPayloads.map((token) => (
                                <div className={classes.asset} key={token.contractAddress}>
                                    <TokenIcon
                                        className={classes.tokenIcon}
                                        address={token.contractAddress}
                                        name={token.name}
                                        pluginID={NetworkPluginID.PLUGIN_EVM}
                                        chainId={Number.parseInt(token.chainId, 10)}
                                        logoURL={token.icon}
                                        size={24}
                                        badgeSize={12}
                                    />
                                    <Typography className={classes.assetName}>{token.symbol}</Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                :   null}
                {tokenPayloads?.length && collectionPayloads?.length ?
                    <Typography className={classes.sectionTitle} textAlign="center">
                        <Trans>or</Trans>
                    </Typography>
                :   null}
                {collectionPayloads?.length ?
                    <div className={classes.section}>
                        <Typography className={classes.sectionTitle}>
                            <Trans>You need to hold any of the following NFTs in your wallet.</Trans>
                        </Typography>

                        <div className={classes.collections}>
                            {collectionPayloads.map((collection) => (
                                <div className={classes.asset} key={collection.contractAddress}>
                                    <TokenIcon
                                        className={classes.tokenIcon}
                                        name={collection.collectionName}
                                        chainId={Number.parseInt(collection.chainId, 10)}
                                        logoURL={collection.icon!}
                                        size={34}
                                        badgeSize={12}
                                    />
                                    <Typography className={classes.assetName}>{collection.collectionName}</Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                :   null}
                <div className={classes.results}>
                    {walletUnsatisfied ?
                        <Typography className={classes.unsatisfied}>
                            <Trans>Your wallet does not meet the eligibility criteria for claiming.</Trans>
                        </Typography>
                    :   null}
                </div>
            </div>
            <IconButton className={classes.closeButton} disableRipple onClick={() => onClose?.()} aria-label="Close">
                <Icons.BaseClose size={30} />
            </IconButton>
        </Box>
    )
})
