import { ProfileIdentifier } from '../../database/type'
import { currentSelectedIdentity } from '../../settings/settings'
import { globalUIState, SocialNetworkUI, stateCreator } from '../../social-network'
import { injectPostCommentsDefault } from '../../social-network/defaults'
import { injectPageInspectorDefault } from '../../social-network/defaults/inject/PageInspector'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/inject/StartSetupGuide'
import { InitAutonomousStateFriends } from '../../social-network/defaults/state/InitFriends'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles'
import { unreachable } from '@dimensiondev/kit'
import { pasteImageToCompositionMinds } from './automation/AttachImageToComposition'
import { gotoNewsFeedPageMinds } from './automation/gotoNewsFeedPage'
import { gotoProfilePageMinds } from './automation/gotoProfilePage'
import { openComposeBoxMinds } from './automation/openComposeBox'
import { pasteTextToCompositionMinds } from './automation/pasteTextToComposition'
import { mindsBase } from './base'
import getSearchedKeywordAtMinds from './collecting/getSearchedKeyword'
import { IdentityProviderMinds } from './collecting/identity'
import { PostProviderMinds } from './collecting/post'
import { PaletteModeProviderMinds, useThemeMindsVariant } from './customization/custom'
import injectCommentBoxAtMinds from './injection/CommentBox'
import { injectPostBoxComposed } from './injection/inject'
import { injectPostInspectorAtMinds } from './injection/PostInspector'
import { injectPostReplacerAtMinds } from './injection/PostReplacer'
import { injectSearchResultBoxAtMinds } from './injection/SearchResult'
import { injectSetupPromptAtMinds } from './injection/SetupPrompt'
import { injectToolboxHintAtMinds } from './injection/ToolboxHint'
import { mindsShared } from './shared'

const mindsUI: SocialNetworkUI.Definition = {
    ...mindsBase,
    ...mindsShared,
    automation: {
        maskCompositionDialog: {
            open: openComposeBoxMinds,
        },
        nativeCommentBox: undefined,
        nativeCompositionDialog: {
            appendText: pasteTextToCompositionMinds,
            // TODO: make a better way to detect
            attachImage: pasteImageToCompositionMinds(),
        },
        redirect: {
            newsFeed: gotoNewsFeedPageMinds,
            profilePage: gotoProfilePageMinds,
        },
    },
    collecting: {
        identityProvider: IdentityProviderMinds,
        postsProvider: PostProviderMinds,
        getSearchedKeyword: getSearchedKeywordAtMinds,
    },
    customization: {
        paletteMode: PaletteModeProviderMinds,
        useTheme: useThemeMindsVariant,
    },
    init(signal) {
        const friends = stateCreator.friends()
        const profiles = stateCreator.profiles()
        InitAutonomousStateFriends(signal, friends, mindsShared.networkIdentifier)
        InitAutonomousStateProfiles(signal, profiles, mindsShared.networkIdentifier)
        return { friends, profiles }
    },
    injection: {
        toolbox: injectToolboxHintAtMinds,
        pageInspector: injectPageInspectorDefault(),
        postInspector: injectPostInspectorAtMinds,
        enhancedPostRenderer: injectPostReplacerAtMinds,
        setupPrompt: injectSetupPromptAtMinds,
        searchResult: injectSearchResultBoxAtMinds,
        newPostComposition: {
            start: injectPostBoxComposed,
            supportedInputTypes: {
                text: true,
                image: true,
            },
            supportedOutputTypes: {
                text: true,
                image: true,
            },
        },
        setupWizard: createTaskStartSetupGuideDefault(),
        commentComposition: {
            compositionBox: injectPostCommentsDefault(),
            commentInspector: injectCommentBoxAtMinds(),
        },
        // NOT SUPPORTED YET
        userBadge: undefined,
    },
    configuration: {
        steganography: {
            password() {
                // ! Change this might be a breaking change !
                return new ProfileIdentifier(
                    'minds.com',
                    ProfileIdentifier.getUserName(IdentityProviderMinds.recognized.value.identifier) ||
                        ProfileIdentifier.getUserName(currentSelectedIdentity[mindsBase.networkIdentifier].value) ||
                        ProfileIdentifier.getUserName(globalUIState.profiles.value[0].identifier) ||
                        unreachable('Cannot figure out password' as never),
                ).toText()
            },
        },
    },
}
export default mindsUI
