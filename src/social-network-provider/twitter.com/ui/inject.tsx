import { PostInfo, SocialNetworkUIInjections } from '../../../social-network/ui'
import { injectPostInspectorDefault } from '../../../social-network/defaults/injectPostInspector'
import { injectKnownIdentityAtTwitter } from './injectKnownIdentity'
import { injectPostDialogAtTwitter } from './injectPostDialog'
import { injectPostDialogHintAtTwitter } from './injectPostDialogHint'

const injectPostBox = () => {
    injectPostDialogAtTwitter()
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
