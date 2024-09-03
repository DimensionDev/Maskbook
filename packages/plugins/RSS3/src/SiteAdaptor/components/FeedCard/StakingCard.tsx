import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { CardFrame, type FeedCardProps } from '../base.js'
import { CardType } from '../share.js'
import { StakingAction } from '../FeedActions/StakingAction.js'

const { Tag, Type } = RSS3BaseAPI
export function isStakingFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.StakingFeed {
    return feed.tag === Tag.Exchange && feed.type === Type.Staking
}

interface StakingFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.StakingFeed
}

/**
 * StakingCard.
 * Including:
 *
 * - TokenStake
 * - TokenUnstake
 */
export function StakingCard({ feed, ...rest }: StakingFeedCardProps) {
    const action = feed.actions.find((x) => x.type === Type.Staking)
    const metadata = action?.metadata

    const cardType = metadata?.action === 'stake' ? CardType.TokenStake : CardType.TokenUnstake

    return (
        <CardFrame type={cardType} feed={feed} {...rest}>
            <StakingAction feed={feed} />
        </CardFrame>
    )
}
