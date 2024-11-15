import type { Subscription } from 'use-subscription'
import type {
    ValueRef,
    EncryptionTargetType,
    NextIDPlatform,
    ObservableWeakMap,
    PersonaIdentifier,
    PostIdentifier,
    ProfileInformation,
} from '@masknet/shared-base'
import type { PaletteMode, Theme } from '@mui/material'
import type { GrayscaleAlgorithm } from '@masknet/encryption'
import type { IdentityResolved, PostInfo } from '@masknet/plugin-infra/content-script'
import type { SerializableTypedMessages } from '@masknet/typed-message'
import type { RenderFragmentsContextType } from '@masknet/typed-message-react'
import type { SharedComponentOverwrite } from '@masknet/shared'
import type { ThemeSettings } from '@masknet/web3-shared-base'
import type { SiteAdaptor } from './SiteAdaptor.js'

export namespace SiteAdaptorUI {
    export interface DeferredDefinition extends SiteAdaptor.Base {
        /**
         * Do not make side effects. It should happen in `.init()`
         * @returns the completion definition of this site adaptor
         * @example load: () => import('./full-definition')
         */
        load(): Promise<{
            default: Definition
        }>
        /**
         * On Hot Module Reload. When call the callback, it will unload the current instance and load the new one.
         */
        hotModuleReload?(onHot: (hot: Definition) => void): void
    }
    export interface Definition extends SiteAdaptor.Base, SiteAdaptor.Shared {
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
            /** Inject a replacer of the original post */
            postReplacer?(signal: AbortSignal, current: PostInfo): void
            /** Display the additional content (decrypted, plugin, ...) below the post */
            postInspector?(signal: AbortSignal, current: PostInfo): void
            /** Add custom actions buttons to the post */
            postActions?(signal: AbortSignal, author: PostInfo): void
            /** Inject a tool box that displayed in the navigation bar of the website */
            toolbox?(signal: AbortSignal, category: 'wallet' | 'application'): void
            banner?(signal: AbortSignal): void
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
            /** Inject UI to the profile cover */
            profileCover?(signal: AbortSignal): void
            /** Inject UI to the profile page */
            profileTabContent?(signal: AbortSignal): void
            /** Inject UI to the setting dialog */
            PluginSettingsDialog?(signal: AbortSignal): void
            setupWizard?(signal: AbortSignal, for_: PersonaIdentifier): void
            openNFTAvatarSettingDialog?(): void

            /**
             * @deprecated
             * TODO: by @Jack-Works This should be in the plugin infra.
             * Site Adaptor provides avatar enhancement point,
             * and plugin infra provides AvatarEnhancementProvider.
             * Only 1 plugin can provide enhancement to avatar.
             */
            userAvatar?(signal: AbortSignal): void
            /** @deprecated same reason as userAvatar */
            enhancedProfileNFTAvatar?(signal: AbortSignal): void
            /** @deprecated same reason as userAvatar */
            profileAvatar?(signal: AbortSignal): void
            /** @deprecated same reason as userAvatar */
            openNFTAvatar?(signal: AbortSignal): void
            /** @deprecated same reason as userAvatar */
            postAndReplyNFTAvatar?(signal: AbortSignal): void
            avatar?(signal: AbortSignal): void
            tips?(signal: AbortSignal): void
            lens?(signal: AbortSignal): void
            badges?(signal: AbortSignal): void
            farcaster?(signal: AbortSignal): void
            nameWidget?(signal: AbortSignal): void
            profileCard?(signal: AbortSignal): void
            switchLogo?(signal: AbortSignal): void
            calendar?(signal: AbortSignal): void
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
            endpoint?: Endpoint
        }
        export interface NativeCompositionDialog {
            open?(): void
            /** Upload the designated image on to the social network composition dialog */
            attachImage?(img: Blob, options?: NativeCompositionAttachImageOptions): Promise<void>
            /** Append text on to the social network composition dialog */
            attachText?(text: string, options?: NativeCompositionAttachTextOptions): Promise<void>
        }
        export interface NativeCompositionAttachImageOptions {
            recover?: boolean
            relatedTextPayload?: string
            reason?: 'timeline' | 'popup' | 'reply'
        }
        export interface NativeCompositionAttachTextOptions {
            recover?: boolean
            reason?: 'timeline' | 'popup' | 'reply' | 'verify'
        }
        export interface PublishPostOptions {
            reason?: 'timeline' | 'popup' | 'reply' | 'verify'
        }
        export interface MaskCompositionDialogOpenOptions {
            target?: EncryptionTargetType
        }
        export interface MaskCompositionDialog {
            open?(
                content: SerializableTypedMessages,
                failedMessage: string,
                options?: MaskCompositionDialogOpenOptions,
            ): void
        }
        export interface NativeCommentBox {
            attachText?(text: string, post: PostInfo, dom: HTMLElement | null, cover?: boolean): void
        }
        export interface Endpoint {
            publishPost?(mediaObjects: Array<string | Blob>, options?: PublishPostOptions): Promise<string>
        }
    }
    export namespace CollectingCapabilities {
        export interface Define {
            /** Resolve the information of who am I on the current network. */
            identityProvider: IdentityResolveProvider
            /** Resolve the information of identity on the current page which has been browsing. */
            currentVisitingIdentityProvider: IdentityResolveProvider
            /** Maintain all the posts up-to-date. */
            postsProvider?: PostsProvider
            /** Resolve the user settings of site theme. */
            themeSettingsProvider: ThemeSettingsProvider
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
        export interface ThemeSettingsProvider {
            readonly recognized: ValueRef<ThemeSettings>
            start(signal: AbortSignal): Promise<void>
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
            i18nOverwrite?: I18NOverwrite
            sharedComponentOverwrite?: SharedComponentOverwrite
            componentOverwrite?: ComponentOverwrite
        }
        export interface PaletteModeProvider {
            current: Subscription<PaletteMode>
            start(signal: AbortSignal): Promise<void>
        }
        export interface ComponentOverwrite {
            RenderFragments?: RenderFragmentsContextType
        }
        export interface I18NOverwrite {
            postBoxEncryptedTextWrapper?: (encrypted: string) => string
        }
    }
    export namespace Configuration {
        export interface Define {
            themeSettings?: ThemeSettings
            nextIDConfig?: NextIDConfig
            steganography?: SteganographyConfig
            tipsConfig?: TipsConfig
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
            getPostIdFromNewPostToast: () => string
        }
        export interface TipsConfig {
            enableUserGuide?: boolean
        }
    }
}
