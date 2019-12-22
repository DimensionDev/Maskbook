import { PostInfo, SocialNetworkUIInjections } from '../../../social-network/ui'
import { injectPostInspectorDefault } from '../../../social-network/defaults/injectPostInspector'
import { injectKnownIdentityAtTwitter } from './injectKnownIdentity'
import { injectPostDialogAtTwitter } from './injectPostDialog'
import { injectPostDialogSpyAtTwitter } from './injectPostDialogSpy'
import { injectPostDialogHintAtTwitter } from './injectPostDialogHint'

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
