import { injectOpenTipsButtonOnProfile } from './ProfileTipsButton.js'
import { injectTipsButtonOnFollowButton } from './FollowTipsButton.js'
import { injectTipsButtonOnPost } from './PostTipsButton.js'

export function injectTips(signal: AbortSignal) {
    injectOpenTipsButtonOnProfile(signal)
    injectTipsButtonOnFollowButton(signal)
    injectTipsButtonOnPost(signal)
}
