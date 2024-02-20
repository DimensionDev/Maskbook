import { injectFarcasterOnConversation } from './injectFarcasterOnConversation.js'
import { injectFarcasterOnPost } from './injectFarcasterOnPost.js'
import { injectFarcasterOnProfile } from './injectFarcasterOnProfile.js'
import { injectFarcasterOnSpaceDock } from './injectFarcasterOnSpaceDock.js'
import { injectFarcasterOnUserCell } from './injectFarcasterOnUserCell.js'

export function injectFarcaster(signal: AbortSignal) {
    injectFarcasterOnProfile(signal)
    injectFarcasterOnPost(signal)
    injectFarcasterOnUserCell(signal)
    injectFarcasterOnConversation(signal)
    injectFarcasterOnSpaceDock(signal)
}
