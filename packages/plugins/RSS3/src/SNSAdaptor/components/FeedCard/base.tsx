import { Icons } from '@masknet/icons'
import type { GeneratedIconNonSquareProps } from '@masknet/icons/utils/internal'
import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers'
import { Typography } from '@mui/material'
import BigNumber from 'bignumber.js'
import formatDateTime from 'date-fns/format'
import type { ComponentType, FC, HTMLProps } from 'react'
import { useViewFeedDetails } from '../../contexts/FeedDetails'

export interface FeedCardBaseProps {
    feed: RSS3BaseAPI.Web3Feed
    /**
     * specified action from the feed
     * for donation feed. there might be multiple actions to render
     */
    action?: RSS3BaseAPI.Web3Feed['actions'][number]
    verbose?: boolean
    disableFee?: boolean
    inspectable?: boolean
}

export interface FeedCardProps extends Omit<HTMLProps<HTMLDivElement>, 'type' | 'action'>, FeedCardBaseProps {}

export enum CardType {
    AchievementBurn = 1,
    AchievementReceive = 2,
    CollectibleBurn = 3,
    CollectibleIn = 4,
    CollectibleMint = 5,
    CollectibleOut = 6,
    DonationDonate = 7,
    DonationLaunch = 8,
    GovernancePropose = 9,
    GovernanceVote = 10,
    NoteCreate = 11,
    NoteEdit = 12,
    NoteLink = 13,
    NoteBurn = 14,
    ProfileBurn = 15,
    ProfileCreate = 16,
    ProfileLink = 17,
    TokenIn = 18,
    TokenLiquidity = 19,
    TokenOut = 20,
    TokenStake = 21,
    TokenSwap = 22,
    UnknownBurn = 23,
    UnknownCancel = 24,
    UnknownIn = 25,
    UnknownOut = 26,
}

type IconComponent = ComponentType<GeneratedIconNonSquareProps<never>>

const iconMap: Record<CardType, IconComponent> = {
    [CardType.AchievementBurn]: Icons.AchievementBurn,
    [CardType.AchievementReceive]: Icons.AchievementReceive,
    [CardType.CollectibleBurn]: Icons.CollectibleBurn,
    [CardType.CollectibleIn]: Icons.CollectibleIn,
    [CardType.CollectibleMint]: Icons.CollectibleMint,
    [CardType.CollectibleOut]: Icons.CollectibleOut,
    [CardType.DonationDonate]: Icons.DonationDonate,
    [CardType.DonationLaunch]: Icons.DonationLaunch,
    [CardType.GovernancePropose]: Icons.GovernancePropose,
    [CardType.GovernanceVote]: Icons.GovernanceVote,
    [CardType.NoteCreate]: Icons.NoteCreate,
    [CardType.NoteEdit]: Icons.NoteEdit,
    [CardType.NoteLink]: Icons.NoteLink,
    [CardType.NoteBurn]: Icons.NoteBurn,
    [CardType.ProfileBurn]: Icons.ProfileBurn,
    [CardType.ProfileCreate]: Icons.ProfileCreate,
    [CardType.ProfileLink]: Icons.ProfileLink,
    [CardType.TokenIn]: Icons.TokenIn,
    [CardType.TokenLiquidity]: Icons.TokenLiquidity,
    [CardType.TokenOut]: Icons.TokenOut,
    [CardType.TokenStake]: Icons.TokenStake,
    [CardType.TokenSwap]: Icons.TokenSwap,
    [CardType.UnknownBurn]: Icons.UnknownBurn,
    [CardType.UnknownCancel]: Icons.UnknownCancel,
    [CardType.UnknownIn]: Icons.UnknownIn,
    [CardType.UnknownOut]: Icons.UnknownOut,
}

const platformIconMap: Record<RSS3BaseAPI.Network | RSS3BaseAPI.Platform, IconComponent | null> = {
    // Networks
    ethereum: Icons.ETH,
    binance_smart_chain: Icons.ETH,
    polygon: Icons.PolygonScan,
    xdai: Icons.Gnosis,
    arbitrum: Icons.Arbitrum,
    optimism: Icons.Optimism,
    fantom: Icons.Fantom,
    avalanche: Icons.Avalanche,
    // TODO icon for zksync is missing
    zksync: Icons.ETH,
    // Platforms
    Gitcoin: Icons.Gitcoin,
    Mirror: Icons.Mirror,
    Snapshot: Icons.Snapshot,
    Uniswap: Icons.Uniswap,
    binance: Icons.BSC,
    Lens: Icons.Mirror,
    // TODO icon for zksync is missing
    crossbell: Icons.Mirror,
    '0x': Icons.ZeroX,
    'ENS Registrar': null,
    CrossSync: Icons.Lens,
    Crossbell: Icons.Crossbell,
    MetaMask: Icons.MetaMask,
    OpenSea: Icons.OpenSea,
    SushiSwap: null,
    'crossbell.io': Icons.Crossbell,
    xLog: Icons.XLog,
}

const useStyles = makeStyles()((theme) => ({
    inspectable: {
        cursor: 'pointer',
    },
    header: {
        display: 'flex',
    },
    fee: {
        display: 'flex',
        fontWeight: 400,
        fontSize: 12,
        borderRadius: '4px',
        backgroundColor: theme.palette.maskColor.bg,
        color: theme.palette.maskColor.third,
        height: 20,
        padding: '0 4px',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: theme.spacing(1.5),
    },
    timestamp: {
        marginLeft: theme.spacing(1.5),
        fontSize: 14,
        fontWeight: 400,
        color: theme.palette.maskColor.third,
    },
    body: {
        marginTop: theme.spacing(1.5),
    },
    icon: {
        marginLeft: theme.spacing(1.5),
    },
}))

export interface CardFrameProps
    extends Omit<HTMLProps<HTMLDivElement>, 'type' | 'action'>,
        Omit<FeedCardBaseProps, 'verbose'> {
    type: CardType
}

export const CardFrame: FC<CardFrameProps> = ({
    type,
    feed,
    action,
    disableFee = true,
    inspectable,
    className,
    children,
    onClick,
    ...rest
}) => {
    const { classes, cx } = useStyles()
    const CardIcon = iconMap[type]
    const PrimaryPlatformIcon = feed.network ? platformIconMap[feed.network] : null
    const ProviderPlatformIcon = feed.platform ? platformIconMap[feed.platform] : null

    const viewDetails = useViewFeedDetails()

    return (
        <article
            className={cx(className, inspectable ? classes.inspectable : null)}
            onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                onClick?.(event)
                if (inspectable) {
                    viewDetails({
                        type,
                        feed,
                        action,
                    })
                }
            }}
            {...rest}>
            <div className={classes.header}>
                <CardIcon width={36} height={18} />
                {!disableFee ? (
                    <div className={classes.fee}>
                        <Icons.Gas size={16} />
                        <Typography ml="4px">{new BigNumber(feed.fee).toFixed(6)}</Typography>
                    </div>
                ) : null}
                {ProviderPlatformIcon ? <ProviderPlatformIcon className={classes.icon} size={18} /> : null}
                {PrimaryPlatformIcon ? <PrimaryPlatformIcon className={classes.icon} size={18} /> : null}
                <Typography className={classes.timestamp}>
                    {formatDateTime(new Date(feed.timestamp), 'MM/dd/yyyy')}
                </Typography>
            </div>
            <div className={classes.body}>{children}</div>
        </article>
    )
}
