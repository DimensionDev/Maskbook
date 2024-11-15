import { injectBadgesOnConversation } from './injectBadgesOnConversation.js'
import { injectBadgesOnPost } from './injectBadgesOnPost.js'
import { injectBadgesOnProfile } from './injectBadgesOnProfile.js'
import { injectBadgesOnSpaceDock } from './injectBadgesOnSpaceDock.js'
import { injectBadgesOnUserCell } from './injectBadgesOnUserCell.js'

export function injectBadges(signal: AbortSignal) {
    injectBadgesOnProfile(signal)
    injectBadgesOnPost(signal)
    injectBadgesOnUserCell(signal)
    injectBadgesOnConversation(signal)
    injectBadgesOnSpaceDock(signal)
}
