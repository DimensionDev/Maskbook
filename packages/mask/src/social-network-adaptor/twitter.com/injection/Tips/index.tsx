import { injectOpenTipsButtonOnProfile } from './ProfileTipButton.js'
import { injectTipsButtonOnFollowButton } from './FollowTipsButton.js'

export function injectTips(signal: AbortSignal) {
    injectOpenTipsButtonOnProfile(signal)
    injectTipsButtonOnFollowButton(signal)
}
