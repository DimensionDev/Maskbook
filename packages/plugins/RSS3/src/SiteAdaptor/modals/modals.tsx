import { SingletonModal } from '@masknet/shared-base'
import type { FeedDetailsModalOpenProps } from './DetailsModal/index.js'
import type { SocialFeedDetailsModalOpenProps } from './SocialFeedDetailsModal/index.js'

export const FeedDetailsModal = new SingletonModal<FeedDetailsModalOpenProps>()
export const SocialFeedDetailsModal = new SingletonModal<SocialFeedDetailsModalOpenProps>()
