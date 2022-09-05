import { injectOpenTipsButtonOnProfile } from './ProfileTipButton'

export function injectTips(signal: AbortSignal) {
    injectOpenTipsButtonOnProfile(signal)
}
