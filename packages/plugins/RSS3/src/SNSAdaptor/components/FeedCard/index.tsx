import type { FeedCardProps } from '../base.js'
import { CollectibleCard, isCollectibleFeed } from './CollectibleCard.js'
import { CommentCard, isCommentFeed } from './CommentCard.js'
import { DonationCard, isDonationFeed } from './DonationCard.js'
import { isLiquidityFeed, LiquidityCard } from './LiquidityCard.js'
import { isNoteFeed, NoteCard } from './NoteCard.js'
import { isTokenSwapFeed, TokenSwapCard } from './TokenSwapCard.js'
import { isTokenOperationFeed, TokenOperationCard } from './TokenOperationCard.js'
import { isVoteFeed, VoteCard } from './VoteCard.js'
import { isProposeFeed, ProposeCard } from './ProposeCard.js'
import { isProfileFeed, ProfileCard } from './ProfileCard.js'

export const FeedCard = ({ feed, ...rest }: FeedCardProps) => {
    if (isTokenOperationFeed(feed)) return <TokenOperationCard feed={feed} {...rest} />

    if (isTokenSwapFeed(feed)) return <TokenSwapCard feed={feed} {...rest} />

    if (isLiquidityFeed(feed)) return <LiquidityCard feed={feed} {...rest} />

    if (isCollectibleFeed(feed)) return <CollectibleCard feed={feed} {...rest} />

    if (isDonationFeed(feed)) return <DonationCard feed={feed} {...rest} />

    if (isNoteFeed(feed)) return <NoteCard feed={feed} {...rest} />

    if (isCommentFeed(feed)) return <CommentCard feed={feed} {...rest} />

    if (isProfileFeed(feed)) return <ProfileCard feed={feed} {...rest} />

    if (isProposeFeed(feed)) return <ProposeCard feed={feed} {...rest} />

    if (isVoteFeed(feed)) return <VoteCard feed={feed} {...rest} />

    return null
}
