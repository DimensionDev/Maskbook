import type { SocialNetworkUIInjections } from '../../../social-network/ui'
import { injectKnownIdentityAtTwitter } from './injectKnownIdentity'
import { injectPostDialogAtTwitter } from './injectPostDialog'
import { injectPostDialogHintAtTwitter } from './injectPostDialogHint'
import { injectPostInspectorAtTwitter } from './injectPostInspector'
import { injectPageInspectorAtTwitter } from './injectPageInspector'
import { injectPostDialogIconAtTwitter } from './injectPostDialogIcon'
import { injectPostReplacerAtTwitter } from './injectPostReplacer'

const injectPostBox = () => {
    injectPostDialogAtTwitter()
    injectPostDialogHintAtTwitter()
    injectPostDialogIconAtTwitter()
}

export const twitterUIInjections: SocialNetworkUIInjections = {
    injectPostBox,
    injectPostReplacer: injectPostReplacerAtTwitter,
    injectPostInspector: injectPostInspectorAtTwitter,
    injectPageInspector: injectPageInspectorAtTwitter,
    injectKnownIdentity: injectKnownIdentityAtTwitter,
}
