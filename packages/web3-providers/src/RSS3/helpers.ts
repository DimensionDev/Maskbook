import { resolveResourceURL } from '@masknet/web3-shared-base'
import type { RSS3BaseAPI } from '../entry-types.js'

/**
 * Normalize RSS3 feed.
 *
 * @affects
 *   feed.actions[number].metadata.image
 *   feed.actions[number].metadata.token.image
 *   feed.actions[number].metadata.logo
 *
 * - resolve image resource
 */
export function normalizedFeed(feed: RSS3BaseAPI.Web3Feed) {
    feed.actions.forEach((action) => {
        if (!action.metadata) return
        if ('image' in action.metadata) {
            action.metadata.image = resolveResourceURL(action.metadata.image)!
        } else if ('token' in action.metadata) {
            action.metadata.token.image = resolveResourceURL(action.metadata.token.image)!
        } else if ('logo' in action.metadata) {
            action.metadata.logo = resolveResourceURL(action.metadata.logo)!
        }
    })
}
