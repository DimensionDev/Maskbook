import { createLookupTableResolver } from '@masknet/shared-base'
import { ActivityType } from '@masknet/web3-shared-base'

export const resolveActivityTypeBackgroundColor = createLookupTableResolver<ActivityType, string>(
    {
        [ActivityType.Sale]: 'rgba(28, 104, 243, 0.1)',
        [ActivityType.Burn]: 'rgba(255, 53, 69, 0.1)',
        [ActivityType.Transfer]: 'rgba(61, 194, 51, 0.1)',
        [ActivityType.Mint]: 'rgba(255, 177, 0, 0.1)',
        [ActivityType.CancelOffer]: 'rgba(255, 177, 0, 0.1)',
        [ActivityType.List]: 'rgba(255, 177, 0, 0.1)',
        [ActivityType.Offer]: 'rgba(255, 177, 0, 0.1)',
    },
    '',
)
