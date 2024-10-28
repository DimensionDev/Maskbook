import { SingletonModal } from '@masknet/shared-base'
import type { FeedDetailsModalOpenProps } from './DetailsModal/index.js'
import type { SocialFeedDetailsModalOpenProps } from './SocialFeedDetailsModal/index.js'
import type { FinanceFeedDetailsModalOpenProps } from './FinanceFeedDetailsModal/index.js'

export const FeedDetailsModal = new SingletonModal<FeedDetailsModalOpenProps>()
export const SocialFeedDetailsModal = new SingletonModal<SocialFeedDetailsModalOpenProps>()
export const FinanceFeedDetailsModal = new SingletonModal<FinanceFeedDetailsModalOpenProps>()
