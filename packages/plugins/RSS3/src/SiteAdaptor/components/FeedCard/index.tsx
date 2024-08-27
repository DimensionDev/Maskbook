import { ErrorBoundary } from '@masknet/shared-base-ui'
import { memo } from 'react'
import type { FeedCardProps } from '../base.js'
import { CollectibleApprovalCard, isCollectibleApprovalFeed } from './CollectibleApprovalCard.js'
import { CollectibleCard, isCollectibleFeed } from './CollectibleCard.js'
import { CommentCard, isCommentFeed } from './CommentCard.js'
import { DonationCard, isDonationFeed } from './DonationCard.js'
import { isLiquidityFeed, LiquidityCard } from './LiquidityCard.js'
import { isNoteFeed, NoteCard } from './NoteCard.js'
import { isProfileFeed, ProfileCard } from './ProfileCard.js'
import { isProfileLinkFeed, ProfileLinkCard } from './ProfileLinkCard.js'
import { isProfileProxyFeed, ProfileProxyCard } from './ProfileProxy.js'
import { isProposeFeed, ProposeCard } from './ProposeCard.js'
import { isStakingFeed, StakingCard } from './StakingCard.js'
import { isTokenBridgeFeed, TokenBridgeCard } from './TokenBridgeCard.js'
import { isTokenOperationFeed, TokenOperationCard } from './TokenOperationCard.js'
import { isTokenSwapFeed, TokenSwapCard } from './TokenSwapCard.js'
import { UnknownCard } from './UnknownCard.js'
import { isVoteFeed, VoteCard } from './VoteCard.js'

export const FeedCard = memo(({ feed, ...rest }: FeedCardProps) => {
    if (isTokenOperationFeed(feed)) return <TokenOperationCard feed={feed} {...rest} />

    if (isTokenSwapFeed(feed)) return <TokenSwapCard feed={feed} {...rest} />

    if (isLiquidityFeed(feed)) return <LiquidityCard feed={feed} {...rest} />

    if (isStakingFeed(feed)) return <StakingCard feed={feed} {...rest} />

    if (isCollectibleFeed(feed)) return <CollectibleCard feed={feed} {...rest} />

    if (isDonationFeed(feed)) return <DonationCard feed={feed} {...rest} />

    if (isNoteFeed(feed)) return <NoteCard feed={feed} {...rest} />

    if (isCommentFeed(feed)) return <CommentCard feed={feed} {...rest} />

    if (isProfileFeed(feed)) return <ProfileCard feed={feed} {...rest} />

    if (isProfileLinkFeed(feed)) return <ProfileLinkCard feed={feed} {...rest} />

    if (isProposeFeed(feed)) return <ProposeCard feed={feed} {...rest} />

    if (isVoteFeed(feed)) return <VoteCard feed={feed} {...rest} />

    if (isCollectibleApprovalFeed(feed)) return <CollectibleApprovalCard feed={feed} {...rest} />

    if (isTokenBridgeFeed(feed)) return <TokenBridgeCard feed={feed} {...rest} />

    if (isProfileProxyFeed(feed)) return <ProfileProxyCard feed={feed} {...rest} />

    return (
        <ErrorBoundary>
            <UnknownCard feed={feed} {...rest} />
        </ErrorBoundary>
    )
})

FeedCard.displayName = 'FeedCard'
