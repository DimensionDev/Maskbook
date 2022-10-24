import type { FeedCardProps } from './base.js'
import { CollectibleCard, isCollectibleFeed } from './CollectibleCard.js'
import { CommentCard, isCommentFeed } from './CommentCard.js'
import { DonationCard, isDonationFeed } from './DonationCard.js'
import { isNoteFeed, NoteCard } from './NoteCard.js'
import { isTokenSwapFeed, TokenSwapCard } from './TokenSwapCard.js'
import { isTokenTransferFeed, TokenTransferCard } from './TokenTransferCard.js'
import { isVoteFeed, VoteCard } from './VoteCard.js'

export const FeedCard = ({ feed, ...rest }: FeedCardProps) => {
    if (isTokenTransferFeed(feed)) return <TokenTransferCard feed={feed} {...rest} />

    if (isTokenSwapFeed(feed)) return <TokenSwapCard feed={feed} {...rest} />

    if (isCollectibleFeed(feed)) return <CollectibleCard feed={feed} {...rest} />

    // @ts-ignore
    // ts will complain about that action is incompatible here.
    if (isDonationFeed(feed)) return <DonationCard feed={feed} {...rest} />

    if (isNoteFeed(feed)) return <NoteCard feed={feed} {...rest} />

    if (isCommentFeed(feed)) return <CommentCard feed={feed} {...rest} />

    if (isVoteFeed(feed)) return <VoteCard feed={feed} {...rest} />

    return null
}
