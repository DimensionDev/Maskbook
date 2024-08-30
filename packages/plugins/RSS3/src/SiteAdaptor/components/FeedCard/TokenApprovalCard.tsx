import { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { CardType } from '../share.js'
import { CardFrame, type FeedCardProps } from '../base.js'
import { TokenApprovalAction } from '../FeedActions/TokenApprovalAction.js'

const { Tag, Type } = RSS3BaseAPI
export function isTokenApprovalFeed(feed: RSS3BaseAPI.Web3Feed): feed is RSS3BaseAPI.TokenApprovalFeed {
    return feed.tag === Tag.Transaction && feed.type === Type.Approval
}

interface TokenApprovalFeedCardProps extends Omit<FeedCardProps, 'feed'> {
    feed: RSS3BaseAPI.TokenApprovalFeed
}

/**
 * @deprecated TokenApprovalAction now gets merged into TokenOperationCard
 * TokenApprovalCard.
 * Including:
 *
 * - TokenApproval
 */
export function TokenApprovalCard({ feed, ...rest }: TokenApprovalFeedCardProps) {
    return (
        <CardFrame type={CardType.TokenApproval} feed={feed} {...rest}>
            <TokenApprovalAction feed={feed} />
        </CardFrame>
    )
}
