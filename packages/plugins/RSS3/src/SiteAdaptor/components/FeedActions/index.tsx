import { memo } from 'react'
import type { FeedCardProps } from '../base.js'
import { isCollectibleApprovalFeed } from '../FeedCard/CollectibleApprovalCard.js'
import { isCollectibleFeed } from '../FeedCard/CollectibleCard.js'
import { isCommentFeed } from '../FeedCard/CommentCard.js'
import { isDonationFeed } from '../FeedCard/DonationCard.js'
import { isLiquidityFeed } from '../FeedCard/LiquidityCard.js'
import { isNoteFeed } from '../FeedCard/NoteCard.js'
import { isProfileFeed } from '../FeedCard/ProfileCard.js'
import { isProfileLinkFeed } from '../FeedCard/ProfileLinkCard.js'
import { isProfileProxyFeed } from '../FeedCard/ProfileProxy.js'
import { isProposeFeed } from '../FeedCard/ProposeCard.js'
import { isTokenApprovalFeed } from '../FeedCard/TokenApprovalCard.js'
import { isTokenBridgeFeed } from '../FeedCard/TokenBridgeCard.js'
import { isTokenOperationFeed } from '../FeedCard/TokenOperationCard.js'
import { isTokenSwapFeed } from '../FeedCard/TokenSwapCard.js'
import { isVoteFeed } from '../FeedCard/VoteCard.js'
import { UnknownCard } from '../FeedCard/UnknownCard.js'
import { isStakingFeed } from '../FeedCard/StakingCard.js'
import { TokenOperationAction } from './TokenOperationAction.js'
import { TokenSwapAction } from './TokenSwapAction.js'
import { LiquidityAction } from './LiquidityAction.js'
import { StakingAction } from './StakingAction.js'
import { CollectibleAction } from './CollectibleAction.js'
import { DonationAction } from './DonationAction.js'
import { NoteAction } from './NoteAction.js'
import { CommentAction } from './CommentAction.js'
import { ProfileAction } from './ProfileAction.js'
import { ProfileLinkAction } from './ProfileLinkAction.js'
import { ProposeAction } from './ProposeAction.js'
import { VoteAction } from './VoteAction.js'
import { TokenBridgeAction } from './TokenBridgeAction.js'
import { ProfileProxyAction } from './ProfileProxy.js'
import { CollectibleApprovalAction } from './CollectibleApprovalAction.js'
import { TokenApprovalAction } from './TokenApprovalAction.js'

export const FeedActions = memo(({ feed, ...rest }: FeedCardProps) => {
    if (isTokenOperationFeed(feed)) return <TokenOperationAction feed={feed} {...rest} />

    if (isTokenSwapFeed(feed)) return <TokenSwapAction feed={feed} {...rest} />

    if (isLiquidityFeed(feed)) return <LiquidityAction feed={feed} {...rest} />

    if (isStakingFeed(feed)) return <StakingAction feed={feed} {...rest} />

    if (isCollectibleFeed(feed)) return <CollectibleAction feed={feed} {...rest} />

    if (isDonationFeed(feed)) return <DonationAction feed={feed} {...rest} />

    if (isNoteFeed(feed)) return <NoteAction feed={feed} {...rest} />

    if (isCommentFeed(feed)) return <CommentAction feed={feed} {...rest} />

    if (isProfileFeed(feed)) return <ProfileAction feed={feed} {...rest} />

    if (isProfileLinkFeed(feed)) return <ProfileLinkAction feed={feed} {...rest} />

    if (isProposeFeed(feed)) return <ProposeAction feed={feed} {...rest} />

    if (isVoteFeed(feed)) return <VoteAction feed={feed} {...rest} />

    if (isTokenApprovalFeed(feed)) return <TokenApprovalAction feed={feed} {...rest} />

    if (isCollectibleApprovalFeed(feed)) return <CollectibleApprovalAction feed={feed} {...rest} />

    if (isTokenBridgeFeed(feed)) return <TokenBridgeAction feed={feed} {...rest} />

    if (isProfileProxyFeed(feed)) return <ProfileProxyAction feed={feed} {...rest} />

    return <UnknownCard feed={feed} {...rest} />
})

FeedActions.displayName = 'FeedActions'
