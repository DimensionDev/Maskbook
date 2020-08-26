import type { SocialNetworkUIInjections } from '../../../social-network/ui'
import { injectKnownIdentityAtTwitter } from './injectKnownIdentity'
import { injectPostDialogAtTwitter } from './injectPostDialog'
import { injectPostDialogHintAtTwitter } from './injectPostDialogHint'
import { injectPostInspectorAtTwitter } from './injectPostInspector'
import { injectPageInspectorAtTwitter } from './injectPageInspector'
import { injectPostDialogIconAtTwitter } from './injectPostDialogIcon'
import { injectPostDummyAtTwitter } from './injectPostDummy'

const injectPostBox = () => {
    injectPostDialogAtTwitter()
    injectPostDialogHintAtTwitter()
    injectPostDialogIconAtTwitter()
}

export const twitterUIInjections: SocialNetworkUIInjections = {
    injectPostBox,
    injectPostDummy: injectPostDummyAtTwitter,
    injectPostInspector: injectPostInspectorAtTwitter,
    injectPageInspector: injectPageInspectorAtTwitter,
    injectKnownIdentity: injectKnownIdentityAtTwitter,
}
