import { injectTipsButtonOnEntry } from './entryInfoTipButton'
import { injectTipsButtonOnMenu } from './MenuAuthorTipButton'

export function injectTips(signal: AbortSignal) {
    injectTipsButtonOnEntry(signal)
    injectTipsButtonOnMenu(signal)
}
