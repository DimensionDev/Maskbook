import { ActivityType } from '@masknet/web3-shared-base'

export function resolveActivityType(type?: string) {
    if (!type) return ActivityType.Transfer
    const type_ = type.toLowerCase()
    if (['created', 'mint'].includes(type_)) return ActivityType.Mint
    if (['successful'].includes(type_)) return ActivityType.Sale
    if (['offer', 'offer_entered', 'bid_withdrawn', 'bid_entered'].includes(type_)) return ActivityType.Offer
    if (['cancel_offer'].includes(type_)) return ActivityType.CancelOffer
    if (['list'].includes(type_)) return ActivityType.List
    if (['sale'].includes(type_)) return ActivityType.Sale
    return ActivityType.Transfer
}
