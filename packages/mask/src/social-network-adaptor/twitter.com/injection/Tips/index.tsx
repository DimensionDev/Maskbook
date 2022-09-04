import { injectOpenTipsButtonOnProfile } from './ProfileTipButton'
import { injectTipsButtonOnFollowButton } from './FollowTipsButton'

export function injectTips(signal: AbortSignal) {
    injectOpenTipsButtonOnProfile(signal)
    injectTipsButtonOnFollowButton(signal)
}
