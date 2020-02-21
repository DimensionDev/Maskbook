import { SocialNetworkUIInjections } from '../../../social-network/ui'
import { injectKnownIdentityAtTwitter } from './injectKnownIdentity'
import { injectPostDialogAtTwitter } from './injectPostDialog'
import { injectPostDialogHintAtTwitter } from './injectPostDialogHint'
import { injectPostInspectorAtTwitter } from './injectPostInspector'

const injectPostBox = () => {
    injectPostDialogAtTwitter()
    injectPostDialogHintAtTwitter()
}

export const twitterUIInjections: SocialNetworkUIInjections = {
    injectPostBox,
    injectPostInspector: injectPostInspectorAtTwitter,
    injectKnownIdentity: injectKnownIdentityAtTwitter,
}
