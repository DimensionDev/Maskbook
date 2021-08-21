import type { ValueRef } from '@dimensiondev/holoflows-kit'
import type {
    Identifier,
    PersonaIdentifier,
    PostIdentifier,
    ProfileIdentifier,
    ReadonlyIdentifierMap,
    ObservableWeakMap,
} from '@masknet/shared'
import type { PaletteMode, Theme } from '@material-ui/core'
import type { InjectedDialogClassKey, InjectedDialogProps } from '../components/shared/InjectedDialog'
import type { Profile } from '../database'
import type { PostInfo } from './PostInfo'
import type { GrayscaleAlgorithm } from '@dimensiondev/stego-js/umd/grayscale'
import type { TypedMessage } from '../protocols/typed-message'
import type { createSNSAdaptorSpecializedPostContext } from './utils/create-post-context'

type ClassNameMap<ClassKey extends string = string> = { [P in ClassKey]: string }
// Don't define values in namespaces
export namespace SocialNetwork {
    export interface PayloadEncoding {
        encoder(text: string): string
        /**
         * the result is candidates
         */
        decoder(text: string): string[]
    }

    export interface Utils {
        /** @returns the homepage url. e.g.: https://twitter.com/ */
        getHomePage?(): string
        /** @returns post URL from PostIdentifier */
        getPostURL?(post: PostIdentifier<Identifier>): URL | null
        /** Is this username valid in this network */
        isValidUsername?(username: string): boolean
        /** How to encode/decode public keys when it is put in the bio. */
        publicKeyEncoding?: PayloadEncoding
        /** How to encode/decode text payload (e.g. make it into a link so it will be shortened by SNS). */
        textPayloadPostProcessor?: PayloadEncoding
        /** Given a text, return a URL that will allow user to share this text */
        getShareLinkURL?(text: string): URL
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
        /**
         * This field _will_ be overwritten by SocialNetworkUI.permessions
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
        permission?: RuntimePermission
        injection: InjectingCapabilities.Define
        automation: AutomationCapabilities.Define
        collecting: CollectingCapabilities.Define
        customization: Customization.Define
        configuration: Configuration.Define
    }
    export type State = AutonomousState & ManagedState
    /** The init() should setup watcher for those states */
    export interface AutonomousState {
        /** @deprecated Performance. Don't use it. */
        readonly friends: ValueRef<ReadonlyIdentifierMap<ProfileIdentifier, Profile>>
        /** My profiles at current network */
        readonly profiles: ValueRef<readonly Profile[]>
    }
    export interface ManagedState {}
    export interface RuntimePermission {
        /** This function should check if Mask has the permission to the site */
        has(): Promise<boolean>
        /** This function should request the related permission, e.g. `browser.permissions.request()` */
        request(): Promise<boolean>
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
            /** Inject a tool box that displayed in the navigation bar of the SNS */
            toolBoxInNavBar?(signal: AbortSignal): void
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
            setupWizard?(signal: AbortSignal, for_: PersonaIdentifier): void
            /** Inject UI to the Profile page */
            enhancedProfileTab?(signal: AbortSignal): void
            enhancedProfile?(signal: AbortSignal): void
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
            /** Automation on the composition dialog that the social network provies */
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
        }
        export interface NativeCompositionAttachTextOptions {
            recover?: boolean
        }
        export interface MaskCompositionDialog {
            open?(content: TypedMessage, options?: MaskCompositionDialogOpenOptions): void
        }
        export interface MaskCompositionDialogOpenOptions {
            target?: 'E2E' | 'Everyone'
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
            /** Maintain all the posts up-to-date. */
            postsProvider?: PostsProvider
            /** Get searched keyword */
            getSearchedKeyword?(): string
        }
        export type ProfileUI = { bioContent: string }
        export type IdentityResolved = Pick<Profile, 'identifier' | 'nickname' | 'avatar'>

        /** Resolve the information of who am I on the current network. */
        export interface IdentityResolveProvider {
            /**
             * Indicate if it is using `$self` or `$unknown` as the account name. This should only be true on Facebook.
             */
            hasDeprecatedPlaceholderName?: boolean
            /**
             * The account that user is using (may not in the database)
             */
            readonly lastRecognized: ValueRef<IdentityResolved>
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
            useTheme?(): Theme
            /** Provide the ability to detect the current color scheme (light or dark) in the current SNS */
            paletteMode?: PaletteModeProvider
            i18nOverwrite?: I18NOverwrite
            componentOverwrite?: ComponentOverwrite
        }
        export interface PaletteModeProvider {
            current: ValueRef<PaletteMode>
            start(signal: AbortSignal): void
        }
        export interface ComponentOverwrite {
            InjectedDialog?: ComponentOverwriteConfig<InjectedDialogProps, InjectedDialogClassKey>
        }
        export interface ComponentOverwriteConfig<Props extends { classes?: any }, Classes extends string> {
            classes?: () => { classes: Partial<ClassNameMap<Classes>> }
            props?: (props: Props) => Props
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
            steganography?: SteganographyConfig
            setupWizard?: SetupWizardConfig
        }
        export interface SteganographyConfig {
            grayscaleAlgorithm?: GrayscaleAlgorithm
            /**
             * !!! Please be careful when design this. !!!
             * !!! Any observable change might cause a breaking change on steganography !!!
             */
            password?(): string
        }
        export interface SetupWizardConfig {
            disableSayHello?: boolean
        }
    }
}

export namespace SocialNetworkWorker {
    export interface WorkerBase {
        /**
         * Hint for partition when finding keys on Gun
         *
         * For Facebook.com, use ""
         * For network with a large number of users, use something like "twitter-"
         * For other networks, to keep the Anti-censor of the gun v2 design,
         * use string like "anonymous-"
         */
        gunNetworkHint: string
    }
    export interface DeferredDefinition extends SocialNetwork.Base, WorkerBase {
        load(): Promise<{ default: Definition }>
        /**
         * On Hot Module Reload. When call the callback, it will unload the current instance and load the new one.
         */
        hotModuleReload?(onHot: (hot: Definition) => void): void
    }

    /**
     * A SocialNetworkWorker is running in the background page
     */
    export interface Definition extends SocialNetwork.Base, SocialNetwork.Shared, WorkerBase {
        tasks: Tasks
    }
    export interface Tasks {}
}
