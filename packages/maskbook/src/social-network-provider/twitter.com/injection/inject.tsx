import type { SocialNetworkUIInjections } from '../../../social-network/ui'
import { injectPostDialogAtTwitter } from './PostDialog'
import { injectSetupPromptAtTwitter } from './SetupPrompt'
import { injectPostDialogHintAtTwitter } from './PostDialogHint'
import { injectPostInspectorAtTwitter } from './PostInspector'
import { injectPostDialogIconAtTwitter } from './PostDialogIcon'
import { injectPostReplacerAtTwitter } from './PostReplacer'
import { injectPageInspectorDefault } from '../../../social-network/defaults/injectPageInspector'
import { injectSearchResultBoxAtTwitter } from './SearchResult'
import { injectToolbarAtTwitter } from './Toolbar'

const injectPostBox = () => {
    injectPostDialogAtTwitter()
    injectPostDialogHintAtTwitter()
    injectPostDialogIconAtTwitter()
}

export const twitterUIInjections: SocialNetworkUIInjections = {
    injectPostBox,
    injectToolbar: injectToolbarAtTwitter,
    injectSetupPrompt: injectSetupPromptAtTwitter,
    injectSearchResultBox: injectSearchResultBoxAtTwitter,
    injectPostReplacer: injectPostReplacerAtTwitter,
    injectPostInspector: injectPostInspectorAtTwitter,
    injectPageInspector: injectPageInspectorDefault(),
}
