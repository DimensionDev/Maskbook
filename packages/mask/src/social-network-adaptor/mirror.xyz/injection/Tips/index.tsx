import { injectTipsButtonOnEntry } from './EntryInfoTipButton'
import { injectTipsButtonOnMenu } from './MenuAuthorTipButton'

export function injectTips(signal: AbortSignal) {
    injectTipsButtonOnEntry(signal)
    injectTipsButtonOnMenu(signal)
}
