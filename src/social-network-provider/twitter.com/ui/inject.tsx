import { LiveSelector, MutationObserverWatcher as MOW } from '@holoflows/kit'
import { PostInfo, SocialNetworkUIInjections } from '../../../social-network/ui'
import { injectPostInspectorDefault } from '../../../social-network/defaults/injectPostInspector'
import { injectKnownIdentityAtTwitter } from './injectKnownIdentity'
import { injectPostDialogHintAtTwitter } from './injectPostDialogHint'
import { injectPostDialogAtTwitter } from './injectPostDialog'
import { injectPostDialogSpyAtTwitter } from './injectPostDialogSpy'

// Closing these shadowRoot prevents external access to them.
const newMOW = (i: LiveSelector<HTMLElement, true>) =>
    new MOW(i)
        .setDOMProxyOption({
            beforeShadowRootInit: { mode: 'closed' },
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

const injectPostBox = () => {
    injectPostDialogAtTwitter()
    injectPostDialogSpyAtTwitter()
    injectPostDialogHintAtTwitter()
}

const injectPostInspector = (current: PostInfo) => {
    return injectPostInspectorDefault({})(current)
}

export const twitterUIInjections: SocialNetworkUIInjections = {
    injectPostBox,
    injectPostInspector,
    injectKnownIdentity: injectKnownIdentityAtTwitter,
}
