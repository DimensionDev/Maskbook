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

export function injectPostBoxComposed(signal?: AbortSignal) {
    injectPostDialogAtTwitter(signal)
    injectPostDialogHintAtTwitter(signal)
    injectPostDialogIconAtTwitter(signal)
}

export const twitterUIInjections: SocialNetworkUIInjections = {
    injectPostBox: injectPostBoxComposed,
    injectToolbar: injectToolbarAtTwitter,
    injectSetupPrompt: injectSetupPromptAtTwitter,
    injectSearchResultBox: injectSearchResultBoxAtTwitter,
    injectPostReplacer: injectPostReplacerAtTwitter,
    injectPostInspector: injectPostInspectorAtTwitter,
    injectPageInspector: injectPageInspectorDefault(),
}
