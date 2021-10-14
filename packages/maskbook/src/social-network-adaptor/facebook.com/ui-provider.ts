import type { SocialNetworkUI } from '../../social-network/types'
import { stateCreator } from '../../social-network/utils'
import { facebookBase } from './base'
import { facebookShared } from './shared'
import { getProfilePageUrlAtFacebook } from './utils/parse-username'
import { taskOpenComposeBoxFacebook } from './automation/openComposeBox'
import { pasteTextToCompositionFacebook } from './automation/pasteTextToComposition'
import { IdentityProviderFacebook } from './collecting/identity'
import { InitAutonomousStateFriends } from '../../social-network/defaults/state/InitFriends'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles'
import { injectCompositionFacebook } from './injection/Composition'
import { injectSetupPromptFacebook } from './injection/SetupPrompt'
import { injectPostCommentsDefault } from '../../social-network/defaults/inject/Comments'
import { pasteToCommentBoxFacebook } from './automation/pasteToCommentBoxFacebook'
import { injectCommentBoxDefaultFactory } from '../../social-network/defaults/inject/CommentBox'
import { injectPostInspectorFacebook } from './injection/PostInspector'
import { PostProviderFacebook } from './collecting/posts'
import { pasteImageToCompositionDefault } from '../../social-network/defaults/automation/AttachImageToComposition'
import { injectPageInspectorDefault } from '../../social-network/defaults/inject/PageInspector'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/inject/StartSetupGuide'
import { GrayscaleAlgorithm } from '@dimensiondev/stego-js/esm/grayscale'
import { currentSelectedIdentity } from '../../settings/settings'
import { unreachable } from '@dimensiondev/kit'
import { ProfileIdentifier } from '@masknet/shared'
import { globalUIState } from '../../social-network'
import { injectToolboxHintAtFacebook as injectToolboxAtFacebook } from './injection/Toolbar'
import { PaletteProviderFacebook } from './customization/PaletteProvider'

const facebookUI: SocialNetworkUI.Definition = {
    ...facebookBase,
    ...facebookShared,
    automation: {
        redirect: {
            profilePage(profile) {
                // there is no PWA way on Facebook desktop.
                // mobile not tested
                location.href = getProfilePageUrlAtFacebook(profile)
            },
            newsFeed() {
                const homeLink = document.querySelector<HTMLAnchorElement>(
                    [
                        '[data-click="bluebar_logo"] a[href]', // PC
                        '#feed_jewel a[href]', // mobile
                    ].join(','),
                )
                if (homeLink) homeLink.click()
                else if (location.pathname !== '/') location.pathname = '/'
            },
        },
        maskCompositionDialog: { open: taskOpenComposeBoxFacebook },
        nativeCompositionDialog: {
            appendText: pasteTextToCompositionFacebook,
            // TODO: make a better way to detect
            attachImage: pasteImageToCompositionDefault(() => false),
        },
        nativeCommentBox: {
            appendText: pasteToCommentBoxFacebook,
        },
    },
    collecting: {
        identityProvider: IdentityProviderFacebook,
        postsProvider: PostProviderFacebook,
    },
    customization: {
        paletteMode: PaletteProviderFacebook,
    },
    init(signal) {
        const friends = stateCreator.friends()
        const profiles = stateCreator.profiles()
        InitAutonomousStateFriends(signal, friends, facebookShared.networkIdentifier)
        InitAutonomousStateProfiles(signal, profiles, facebookShared.networkIdentifier)
        return { friends, profiles }
    },
    injection: {
        newPostComposition: {
            start: injectCompositionFacebook,
            supportedOutputTypes: {
                text: true,
                image: true,
            },
            supportedInputTypes: {
                text: true,
                image: true,
            },
        },
        // Not supported yet
        enhancedPostRenderer: undefined,
        userBadge: undefined,
        searchResult: undefined,
        setupPrompt: injectSetupPromptFacebook,
        commentComposition: {
            compositionBox: injectPostCommentsDefault(),
            commentInspector: injectCommentBoxDefaultFactory(
                pasteToCommentBoxFacebook,
                undefined,
                undefined,
                (node) => {
                    setTimeout(() => {
                        node.after.style.flexBasis = '100%'
                        node.current.parentElement!.style.flexWrap = 'wrap'
                    })
                },
            ),
        },
        postInspector: injectPostInspectorFacebook,
        pageInspector: injectPageInspectorDefault(),
        setupWizard: createTaskStartSetupGuideDefault(),
        toolbox: injectToolboxAtFacebook,
    },
    configuration: {
        steganography: {
            // ! the color image cannot compression resistance in Facebook
            grayscaleAlgorithm: GrayscaleAlgorithm.LUMINANCE,
            password() {
                // ! Change this might be a breaking change !
                return new ProfileIdentifier(
                    'facebook.com',
                    ProfileIdentifier.getUserName(IdentityProviderFacebook.recognized.value.identifier) ||
                        ProfileIdentifier.getUserName(currentSelectedIdentity[facebookBase.networkIdentifier].value) ||
                        ProfileIdentifier.getUserName(globalUIState.profiles.value[0].identifier) ||
                        unreachable('Cannot figure out password' as never),
                ).toText()
            },
        },
    },
}
export default facebookUI
