import { Image } from '@masknet/shared'
import { makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { useMemo } from 'react'
import { Translate } from '../../../locales/i18n_generated.js'
import { useAddressLabel } from '../../hooks/index.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType, getCost, getLastAction } from '../share.js'
import { AddressLabel, formatValue, Label } from './common.js'

const useStyles = makeStyles<void, 'image' | 'verbose' | 'info' | 'center' | 'failedImage'>()((theme, _, refs) => ({
    summary: {
        color: theme.palette.maskColor.third,
    },
    verbose: {},
    image: {
        img: {
            objectFit: 'cover',
        },
    },
    center: {},
    failedImage: {},
    body: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: theme.spacing(1.5),
        [`&.${refs.center}`]: {
            alignItems: 'center',
        },
        [`&.${refs.verbose}`]: {
            display: 'block',
            [`.${refs.image}`]: {
                width: 552,
                height: 'auto',
                aspectRatio: 'auto',
            },
            [`.${refs.image}.${refs.failedImage}`]: {
                height: 100,
                width: 100,
                marginLeft: 'auto',
                marginRight: 'auto',
            },
            [`.${refs.info}`]: {
                marginLeft: 0,
                marginTop: theme.spacing(1.5),
            },
        },
        [`.${refs.image}`]: {
            width: 64,
            height: 64,
            aspectRatio: '1 / 1',
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
        },
    },
    info: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontSize: 14,
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        marginLeft: theme.spacing(1.5),
        overflow: 'auto',
    },
    title: {
        fontWeight: 700,
    },
    subtitle: {
        fontWeight: 400,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
    },
    attributes: {
        display: 'grid',
        marginTop: theme.spacing(1.5),
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridGap: theme.spacing(2, 2),
    },
    attribute: {
        backgroundColor: theme.palette.maskColor.bg,
        padding: theme.spacing(1.5),
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'space-between',
        flexGrow: 0,
        flexShrink: 0,
        overflow: 'hidden',
    },
    attributeType: {
        color: theme.palette.maskColor.second,
        textTransform: 'uppercase',
        fontSize: 14,
        fontWeight: 400,
    },
    attributeValue: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 700,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
}))

const { Tag, Type } = RSS3BaseAPI
export function isCollectibleFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.CollectibleFeed {
    return feed.tag === Tag.Collectible && [Type.Mint, Type.Trade, Type.Transfer, Type.Burn].includes(feed.type)
}

function isRegisteringENS(feed: RSS3BaseAPI.CollectibleFeed) {
    return feed.actions[1]?.platform === 'ENS Registrar'
}

interface CollectibleCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.CollectibleFeed
}

/**
 * CollectibleCard
 * Including:
 *
 * - CollectibleIn
 * - CollectibleBurn
 * - CollectibleIn
 * - CollectibleMint
 * - CollectibleOut
 */
export function CollectibleCard({ feed, ...rest }: CollectibleCardProps) {
    const { verbose } = rest
    const { classes, cx } = useStyles()

    const user = useAddressLabel(feed.owner)

    const { metadata, cardType, summary } = useMemo(() => {
        let action
        let metadata
        switch (feed.type) {
            case Type.Mint:
                // If only one action, it should be free minting
                metadata = getLastAction(feed as RSS3BaseAPI.CollectibleMintFeed).metadata
                return {
                    cardType: CardType.CollectibleMint,
                    metadata,
                    summary: (
                        <Translate.collectible_mint
                            values={{
                                user,
                                collectible: verbose ? metadata!.name : 'an NFT',
                                cost_value: formatValue(metadata?.cost),
                                cost_symbol: metadata?.cost?.symbol ?? '',
                                context: metadata?.cost ? 'cost' : 'no_cost',
                            }}
                            components={{
                                user: <Label />,
                                cost: <Label />,
                                collectible: verbose ? <Label /> : <span />,
                            }}
                        />
                    ),
                }
            case Type.Trade:
                action = getLastAction(feed as RSS3BaseAPI.CollectibleTradeFeed)
                metadata = action.metadata
                const cost = getCost(feed as RSS3BaseAPI.CollectibleTradeFeed)
                return {
                    cardType: CardType.CollectibleOut,
                    metadata,
                    summary: (
                        <Translate.collectible_trade
                            values={{
                                user,
                                collectible: verbose ? metadata!.name : 'an NFT',
                                recipient: formatEthereumAddress(action.address_to ?? '', 4),
                                cost_value: formatValue(cost),
                                cost_symbol: cost?.symbol ?? '',
                                platform: feed.platform!,
                                context: feed.platform ? 'platform' : 'no_platform',
                            }}
                            components={{
                                recipient: <AddressLabel address={action.address_to} />,
                                bold: <Label />,
                                collectible: verbose ? <Label /> : <span />,
                            }}
                        />
                    ),
                }
            case Type.Transfer:
                if (isRegisteringENS(feed)) {
                    return {
                        cardType: CardType.CollectibleIn,
                        metadata: feed.actions[1].metadata,
                        summary: (
                            <Translate.collectible_register_ens
                                values={{
                                    user,
                                    ens: verbose ? feed.actions[1].metadata!.name : 'an ENS',
                                    cost_value: formatValue(
                                        (feed.actions[0] as RSS3BaseAPI.CollectibleTransferAction).metadata,
                                    ),
                                    cost_symbol: feed.actions[0].metadata?.symbol ?? '',
                                }}
                                components={{
                                    user: <Label />,
                                    cost: <Label />,
                                    ens: verbose ? <Label /> : <span />,
                                }}
                            />
                        ),
                    }
                }
                action = getLastAction(feed as RSS3BaseAPI.CollectibleTransferFeed)
                metadata = action.metadata
                const standard = feed.actions[0].metadata?.standard
                const costMetadata: RSS3BaseAPI.TransactionMetadata | undefined =
                    standard && ['Native', 'ERC-20'].includes(standard)
                        ? (feed.actions[0].metadata as RSS3BaseAPI.TransactionMetadata)
                        : undefined
                const isSending = isSameAddress(feed.owner, action.address_from)
                const otherAddress = isSending ? action.address_to : action.address_from
                return {
                    cardType: isSending ? CardType.CollectibleOut : CardType.CollectibleIn,
                    metadata,
                    summary: (
                        <Translate.collectible_operation
                            values={{
                                user,
                                collectible: verbose ? metadata!.name : 'an NFT',
                                other: formatEthereumAddress(otherAddress ?? '', 4),
                                context: isSending ? 'send' : costMetadata ? 'claim_cost' : 'claim',
                                cost_value: formatValue(costMetadata),
                                cost_symbol: costMetadata?.symbol!,
                            }}
                            components={{
                                user: <Label />,
                                other: <AddressLabel address={otherAddress} />,
                                collectible: verbose ? <Label /> : <span />,
                                cost: <Label />,
                            }}
                        />
                    ),
                }
            case Type.Burn:
                metadata = getLastAction(feed as RSS3BaseAPI.CollectibleBurnFeed).metadata
                return {
                    cardType: CardType.CollectibleBurn,
                    metadata,
                    summary: (
                        <Translate.collectible_burn
                            values={{
                                user,
                                collectible: verbose ? metadata!.name : 'an NFT',
                            }}
                            components={{
                                user: <Label />,
                                collectible: verbose ? <Label /> : <span />,
                            }}
                        />
                    ),
                }
        }

        return { summary: '', cardType: CardType.CollectibleIn }
    }, [feed, user])

    const imageWidth = verbose ? '100%' : 64
    const imageHeight = verbose ? 'auto' : 64
    const attributes = metadata && 'attributes' in metadata ? metadata.attributes?.filter((x) => x.trait_type) : []

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            <Typography className={classes.summary}>{summary}</Typography>
            {metadata ? (
                <div
                    className={cx(classes.body, {
                        [classes.verbose]: verbose,
                        [classes.center]: !verbose && !metadata.description,
                    })}>
                    <Image
                        classes={{ container: classes.image, failed: classes.failedImage }}
                        src={metadata.image}
                        width={imageWidth}
                        height={imageHeight}
                    />
                    <div className={classes.info}>
                        {verbose ? null : <Typography className={classes.title}>{metadata.name}</Typography>}
                        {metadata.description ? (
                            <Typography className={classes.subtitle}>{metadata.description}</Typography>
                        ) : null}
                    </div>
                    {verbose && attributes?.length ? (
                        <div className={classes.attributes}>
                            {attributes.map((attribute) => {
                                const value = Array.isArray(attribute.value)
                                    ? attribute.value.map((x) => x.uri).join('\n')
                                    : attribute.value

                                return (
                                    <div className={classes.attribute} key={attribute.trait_type}>
                                        <Typography className={classes.attributeType}>
                                            {attribute.trait_type}
                                        </Typography>
                                        <TextOverflowTooltip title={value} as={ShadowRootTooltip}>
                                            <Typography className={classes.attributeValue}>{value}</Typography>
                                        </TextOverflowTooltip>
                                    </div>
                                )
                            })}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </CardFrame>
    )
}
