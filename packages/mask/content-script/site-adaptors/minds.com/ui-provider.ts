/* eslint-disable tss-unused-classes/unused-classes */
import type { SiteAdaptorUI } from '@masknet/types'
import { makeStyles } from '@masknet/theme'
import { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import { activatedSiteAdaptor_state, creator, stateCreator } from '../../site-adaptor-infra/index.js'
import { injectPostCommentsDefault } from '../../site-adaptor-infra/defaults/index.js'
import { injectPageInspectorDefault } from '../../site-adaptor-infra/defaults/inject/PageInspector.js'
import { createTaskStartSetupGuideDefault } from '../../site-adaptor-infra/defaults/inject/StartSetupGuide.js'
import { InitAutonomousStateProfiles } from '../../site-adaptor-infra/defaults/state/InitProfiles.js'
import { pasteImageToCompositionMinds } from './automation/AttachImageToComposition.js'
import { openComposeBoxMinds } from './automation/openComposeBox.js'
import { pasteTextToCompositionMinds } from './automation/pasteTextToComposition.js'
import { mindsBase } from './base.js'
import getSearchedKeywordAtMinds from './collecting/getSearchedKeyword.js'
import { IdentityProviderMinds } from './collecting/identity.js'
import { ThemeSettingsProviderMinds } from './collecting/theme.js'
import { PostProviderMinds } from './collecting/post.js'
import { useThemeMindsVariant } from './customization/custom.js'
import injectCommentBoxAtMinds from './injection/CommentBox.js'
import { injectPostBoxComposed } from './injection/inject.js'
import { injectPostInspectorAtMinds } from './injection/PostInspector.js'
import { injectPostReplacerAtMinds } from './injection/PostReplacer.js'
import { injectSearchResultInspectorAtMinds } from './injection/SearchResultInspector.js'
import { injectBannerAtMinds } from './injection/Banner.js'
import { injectToolboxHintAtMinds } from './injection/ToolboxHint.js'
import { MindsRenderFragments } from './customization/render-fragments.js'
import { enableFbStyleTextPayloadReplace } from '../../../shared-ui/TypedMessageRender/transformer.js'
import { injectMindsProfileCover } from './injection/ProfileCover.js'
import { injectAvatar } from './injection/Avatar/index.js'
import { mindsShared } from './shared.js'

const CurrentVisitingIdentityProviderDefault: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(signal) {},
}

const useInjectedDialogClassesOverwriteMinds = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        root: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            [smallQuery]: {
                display: 'block !important',
            },
        },
        container: {
            alignItems: 'center',
        },
        paper: {
            width: '600px !important',
            minHeight: 400,
            maxHeight: 620,
            maxWidth: 'none',
            boxShadow: 'none',
            backgroundImage: 'none',
            [smallQuery]: {
                display: 'block !important',
                margin: 12,
            },
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        dialogTitle: {
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: 16,
            position: 'relative',
            background: theme.palette.maskColor.modalTitleBg,
            borderBottom: 'none',
            '& > p': {
                fontSize: 18,
                lineHeight: '22px',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            [smallQuery]: {
                display: 'flex',
                justifyContent: 'start',
                maxWidth: 600,
                margin: '0 auto',
                padding: '7px 14px 6px 11px !important',
            },
        },
        dialogContent: {
            backgroundColor: theme.palette.maskColor.bottom,
            [smallQuery]: {
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 600,
                margin: '0 auto',
                padding: '7px 14px 6px',
            },
        },
        dialogActions: {
            backgroundColor: theme.palette.maskColor.bottom,
            padding: '6px 16px',
            [smallQuery]: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                maxWidth: 600,
                margin: '0 auto',
                padding: '7px 14px 6px !important',
            },
        },
        dialogBackdropRoot: {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(110, 118, 125, 0.4)' : 'rgba(0, 0, 0, 0.4)',
        },
    }
})

const mindsUI: SiteAdaptorUI.Definition = {
    ...mindsBase,
    ...mindsShared,
    automation: {
        maskCompositionDialog: {
            open: openComposeBoxMinds,
        },
        nativeCommentBox: undefined,
        nativeCompositionDialog: {
            attachText: pasteTextToCompositionMinds,
            // TODO: make a better way to detect
            attachImage: pasteImageToCompositionMinds(),
        },
    },
    collecting: {
        identityProvider: IdentityProviderMinds,
        postsProvider: PostProviderMinds,
        themeSettingsProvider: ThemeSettingsProviderMinds,
        currentVisitingIdentityProvider: CurrentVisitingIdentityProviderDefault,
        getSearchedKeyword: getSearchedKeywordAtMinds,
    },
    customization: {
        sharedComponentOverwrite: {
            InjectedDialog: {
                classes: useInjectedDialogClassesOverwriteMinds,
            },
        },
        componentOverwrite: {
            RenderFragments: MindsRenderFragments,
        },
        useTheme: useThemeMindsVariant,
    },
    init(signal) {
        const profiles = stateCreator.profiles()
        InitAutonomousStateProfiles(signal, profiles, mindsShared.networkIdentifier)
        enableFbStyleTextPayloadReplace()
        return { profiles }
    },
    injection: {
        toolbox: injectToolboxHintAtMinds,
        profileCover: injectMindsProfileCover,
        pageInspector: injectPageInspectorDefault(),
        postInspector: injectPostInspectorAtMinds,
        postReplacer: injectPostReplacerAtMinds,
        banner: injectBannerAtMinds,
        searchResult: injectSearchResultInspectorAtMinds,
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
        avatar: injectAvatar,
    },
    configuration: {
        steganography: {
            // ! Change this might be a breaking change !
            password() {
                const id =
                    IdentityProviderMinds.recognized.value.identifier?.userId ||
                    activatedSiteAdaptor_state!.profiles.value?.[0].identifier.userId
                if (!id) throw new Error('Cannot figure out password')
                return ProfileIdentifier.of(EnhanceableSite.Minds, id)
                    .expect(`${id} should be a valid user id`)
                    .toText()
            },
        },
    },
}
export default mindsUI
