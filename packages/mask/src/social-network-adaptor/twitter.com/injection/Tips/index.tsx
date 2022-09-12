import { injectOpenTipsButtonOnProfile } from './ProfileTipButton.js'

export function injectTips(signal: AbortSignal) {
    injectOpenTipsButtonOnProfile(signal)
}
