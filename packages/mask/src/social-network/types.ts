import type { ValueRef } from '@dimensiondev/holoflows-kit'
import type { GrayscaleAlgorithm, SocialNetworkEnum } from '@masknet/encryption'
import type { IdentityResolved, PostInfo } from '@masknet/plugin-infra/content-script'
import type {
    EncryptionTargetType,
    NextIDPlatform,
    ObservableWeakMap,
    PersonaIdentifier,
    PostIdentifier,
    ProfileIdentifier,
    ProfileInformation,
} from '@masknet/shared-base'
import type { SerializableTypedMessages } from '@masknet/typed-message'
import type { RenderFragmentsContextType } from '@masknet/typed-message/dom'
import type { SharedComponentOverwrite } from '@masknet/shared'
import type { PaletteMode, Theme } from '@mui/material'
import type { Subscription } from 'use-subscription'
import type { createSNSAdaptorSpecializedPostContext } from './utils/create-post-context'

export declare namespace SocialNetwork {
    export interface Utils {
        /** @returns post URL from PostIdentifier */
        getPostURL?(post: PostIdentifier): URL | null
        /** Is this username valid in this network */
        isValidUsername?(username: string): boolean
        /** Handle share */
        share?(text: string): void
        createPostContext: ReturnType<typeof createSNSAdaptorSpecializedPostContext>
    }
    export interface Shared {
        utils: Utils
    }
    export interface Base {
        /**
         * This name is used internally and should be unique.
         *
         * !!! THIS SHOULD NOT BE USED TO CONSTRUCT A NEW ProfileIdentifier !!!
         */
        networkIdentifier: string
        encryptionNetwork: SocialNetworkEnum
        /**
         * This field _will_ be overwritten by SocialNetworkUI.permissions
         */
        declarativePermissions: SocialNetworkUI.DeclarativePermission
        /** Should this UI content script activate? */
        shouldActivate(location: Location | URL): boolean
        /** This provider is not ready for production, Mask will not use it in production */
        notReadyForProduction?: boolean
    }
}
export namespace SocialNetworkUI {
    export interface DeferredDefinition extends SocialNetwork.Base {
        /**
         * Do not make side effects. It should happen in `.init()`
         * @returns the completion definition of this SNS
         * @example load: () => import('./full-definition')
         */
        load(): Promise<{ default: Definition }>
        /**
         * On Hot Module Reload. When call the callback, it will unload the current instance and load the new one.
         */
        hotModuleReload?(onHot: (hot: Definition) => void): void
    }
    export interface Definition extends SocialNetwork.Base, SocialNetwork.Shared {
        /** @returns the states */
        init(signal: AbortSignal): Readonly<AutonomousState> | Promise<Readonly<AutonomousState>>
        injection: InjectingCapabilities.Define
        automation: AutomationCapabilities.Define
        collecting: CollectingCapabilities.Define
        customization: Customization.Define
        configuration: Configuration.Define
    }
    /** The init() should setup watcher for those states */
    export interface AutonomousState {
        /** My profiles at current network */
        readonly profiles: ValueRef<readonly ProfileInformation[]>
    }
    export interface DeclarativePermission {
        origins: readonly string[]
    }
    export namespace InjectingCapabilities {
        export interface Define {
            /** Inject the UI that used to open the composition UI */
            newPostComposition?: NewPostComposition
            commentComposition?: CommentComposition
            enhancedPostRenderer?(signal: AbortSignal, current: PostInfo): void
            /** Display the additional content (decrypted, plugin, ...) below the post */
            postInspector?(signal: AbortSignal, current: PostInfo): void
            /** Add custom actions buttons to the post */
            postActions?(signal: AbortSignal, author: PostInfo): void
            /** Inject a tool box that displayed in the navigation bar of the SNS */
            toolbox?(signal: AbortSignal, category: 'wallet' | 'application'): void
            /** Inject the UI that used to notify if the user has not completely setup the current network. */
            setupPrompt?(signal: AbortSignal): void
            /**
             * TODO: explain what is a page inspector
             */
            pageInspector?(signal: AbortSignal): void
            /** Inject a badge to a user. */
            userBadge?(signal: AbortSignal): void
            /** Inject UI to the search result */
            searchResult?(signal: AbortSignal): void
            /** Inject UI to the profile tab */
            profileTab?(signal: AbortSignal): void
            /** Inject UI to the profile page */
            profileTabContent?(signal: AbortSignal): void
            setupWizard?(signal: AbortSignal, for_: PersonaIdentifier): void
            openNFTAvatarSettingDialog?(): void

            /**
             * @deprecated
             * TODO: by @Jack-Works This should be in the plugin infra.
             * SNS Adaptor provides avatar enhancement point,
             * and plugin infra provides AvatarEnhancementProvider.
             * Only 1 plugin can provide enhancement to avatar.
             */
            userAvatar?(signal: AbortSignal): void
            /** @deprecated same reason as userAvatar */
            enhancedProfileNFTAvatar?(signal: AbortSignal): void
            /** @deprecated same reason as userAvatar */
            profileAvatar?(signal: AbortSignal): void
            /** @deprecated same reason as userAvatar */
            profileTip?(signal: AbortSignal): void
            /** @deprecated same reason as userAvatar */
            openNFTAvatar?(signal: AbortSignal): void
            /** @deprecated same reason as userAvatar */
            postAndReplyNFTAvatar?(signal: AbortSignal): void
            /** @deprecated same reason as useAvatar */
            avatarClipNFT?(signal: AbortSignal): void
        }
        export interface NewPostComposition {
            start(signal: AbortSignal): void
            /** The platform support which kind of content? e.g. If text is false, then the image payload is enforced. */
            supportedOutputTypes: NewPostCompositionSupportedTypes
            supportedInputTypes: NewPostCompositionSupportedTypes
        }
        export interface NewPostCompositionSupportedTypes {
            image: boolean
            text: boolean
        }
        export interface CommentComposition {
            /** It should inject the comment box for composing new comments */
            compositionBox(signal: AbortSignal, current: PostInfo): void
            /** It should inject the post comments */
            commentInspector(signal: AbortSignal, current: PostInfo): void
        }
    }
    export namespace AutomationCapabilities {
        export interface Define {
            /** Automation on the composition dialog that the social network provides */
            nativeCompositionDialog?: NativeCompositionDialog
            maskCompositionDialog?: MaskCompositionDialog
            nativeCommentBox?: NativeCommentBox
            redirect?: Redirect
        }
        export interface NativeCompositionDialog {
            /** Upload the designated image on to the social network composition dialog */
            attachImage?(url: string | Blob, options?: NativeCompositionAttachImageOptions): void
            appendText?(text: string, options?: NativeCompositionAttachTextOptions): void
            open?(): void
        }
        export interface NativeCompositionAttachImageOptions {
            recover?: boolean
            relatedTextPayload?: string
            reason?: 'timeline' | 'popup' | 'reply'
        }
        export interface NativeCompositionAttachTextOptions {
            recover?: boolean
            reason?: 'timeline' | 'popup' | 'reply'
        }
        export interface MaskCompositionDialog {
            open?(content: SerializableTypedMessages, options?: MaskCompositionDialogOpenOptions): void
        }
        export interface MaskCompositionDialogOpenOptions {
            target?: EncryptionTargetType
        }
        export interface NativeCommentBox {
            appendText?(text: string, post: PostInfo, dom: HTMLElement | null, cover?: boolean): void
        }
        export interface Redirect {
            profilePage?(profile: ProfileIdentifier): void
            newsFeed?(): void
        }
    }
    export namespace CollectingCapabilities {
        export interface Define {
            /** Resolve the information of who am I on the current network. */
            identityProvider?: IdentityResolveProvider
            /** Resolve the information of identity on the current page which has been browsing. */
            currentVisitingIdentityProvider?: IdentityResolveProvider
            /** Maintain all the posts up-to-date. */
            postsProvider?: PostsProvider
            /** Get searched keyword */
            getSearchedKeyword?(): string
        }

        /** Resolve the information of who am I on the current network. */
        export interface IdentityResolveProvider {
            /**
             * Indicate if it is using `$self` or `$unknown` as the account name. This should only be true on Facebook.
             */
            hasDeprecatedPlaceholderName?: boolean
            /**
             * The account that user is using (may not in the database)
             */
            readonly recognized: ValueRef<IdentityResolved>
            /**
             * Start to maintain the posts.
             * It should add new seen posts and remove gone posts.
             */
            start(signal: AbortSignal): void
        }
        /** Maintain all the posts up-to-date. */
        export interface PostsProvider {
            /**
             * Posts that current detectable. The key is irrelevant to the Mask
             */
            readonly posts: ObservableWeakMap<object, PostInfo>
            /**
             * Start to maintain the posts.
             * It should add new seen posts and remove gone posts.
             */
            start(signal: AbortSignal): void
        }
    }
    export namespace Customization {
        export interface Define {
            /**
             * This is a React hook.
             *
             * Should follow the color scheme of the website.
             */
            useTheme?(baseTheme: Theme): Theme
            /** Provide the ability to detect the current color scheme (light or dark) in the current SNS */
            paletteMode?: PaletteModeProvider
            i18nOverwrite?: I18NOverwrite
            sharedComponentOverwrite?: SharedComponentOverwrite
            componentOverwrite?: ComponentOverwrite
        }
        export interface PaletteModeProvider {
            current: Subscription<PaletteMode>
            start(signal: AbortSignal): void
        }
        export interface ComponentOverwrite {
            RenderFragments?: RenderFragmentsContextType
        }
        export interface I18NOverwrite {
            [namespace: string]: I18NOverwriteNamespace
        }
        export interface I18NOverwriteNamespace {
            [i18nKey: string]: I18NOverwriteNamespaceString
        }
        export interface I18NOverwriteNamespaceString {
            [overwritingLanguage: string]: string
        }
    }
    export namespace Configuration {
        export interface Define {
            nextIDConfig?: NextIDConfig
            steganography?: SteganographyConfig
        }
        export interface SteganographyConfig {
            grayscaleAlgorithm?: GrayscaleAlgorithm
            /**
             * !!! Please be careful when design this. !!!
             * !!! Any observable change might cause a breaking change on steganography !!!
             */
            password?(): string
        }
        export interface NextIDConfig {
            enable?: boolean
            platform: NextIDPlatform
            collectVerificationPost: (keyword: string) => PostIdentifier | null
        }
    }
}
