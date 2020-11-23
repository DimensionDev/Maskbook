import type { SocialNetworkUIInjections } from '../../../social-network/ui'
import { injectPostDialogAtTwitter } from './injectPostDialog'
import { injectSetupPromptAtTwitter } from './injectSetupPrompt'
import { injectPostDialogHintAtTwitter } from './injectPostDialogHint'
import { injectPostInspectorAtTwitter } from './injectPostInspector'
import { injectPostDialogIconAtTwitter } from './injectPostDialogIcon'
import { injectPostReplacerAtTwitter } from './injectPostReplacer'
import { injectPageInspectorDefault } from '../../../social-network/defaults/injectPageInspector'
import { injectSearchResultBoxAtTwitter } from './injectSearchResultBox'

const injectPostBox = () => {
    injectPostDialogAtTwitter()
    injectPostDialogHintAtTwitter()
    injectPostDialogIconAtTwitter()
}

export const twitterUIInjections: SocialNetworkUIInjections = {
    injectPostBox,
    injectSetupPrompt: injectSetupPromptAtTwitter,
    injectSearchResultBox: injectSearchResultBoxAtTwitter,
    injectPostReplacer: injectPostReplacerAtTwitter,
    injectPostInspector: injectPostInspectorAtTwitter,
    injectPageInspector: injectPageInspectorDefault(),
}
