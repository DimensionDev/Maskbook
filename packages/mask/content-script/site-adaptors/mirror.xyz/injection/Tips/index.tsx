import { injectOnMenu } from './MenuAuthorTipButton.js'
import { injectOnVerification } from './PostVerification.js'
import { injectTipsButtonOnProfile as injectOnProfile } from './ProfilePage.js'
import { adjustArticleInfoBar } from './adjustArticleInfoBar.js'

export function injectTips(signal: AbortSignal) {
    injectOnMenu(signal)
    injectOnProfile(signal)
    injectOnVerification(signal)
    adjustArticleInfoBar(signal)
}
