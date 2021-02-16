import { env, Env, Preference, ProfileUI, SocialNetworkWorkerAndUIDefinition } from './shared'
import { ValueRef, assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import type { Group, Profile } from '../database'
import { ProfileIdentifier, PersonaIdentifier } from '../database/type'
import { defaultTo, isNull } from 'lodash-es'
import Services from '../extension/service'
import { defaultSharedSettings } from './defaults/shared'
import { defaultSocialNetworkUI } from './defaults/ui'
import { nopWithUnmount } from '../utils/utils'
import type { Theme } from '@material-ui/core'
import { useMaskbookTheme } from '../utils/theme'
import { untilDomLoaded } from '../utils/dom'
import type { I18NStrings } from '../utils/i18n-next'
import i18nNextInstance from '../utils/i18n-next'
import type { ObservableWeakMap } from '../utils/ObservableMapSet'
import type { PostInfo } from './PostInfo'
import type { InjectedDialogProps } from '../components/shared/InjectedDialog'
import { editMetadata } from '../protocols/typed-message'
import type { ReadonlyIdentifierMap } from '../database/IdentifierMap'
import { Flags } from '../utils/flags'

if (!process.env.STORYBOOK) {
    assertEnvironment.oneOf(Environment.ContentScript, Environment.ManifestOptions, Environment.ManifestBrowserAction)
}

//#region SocialNetworkUI
export interface SocialNetworkUIDefinition
    extends SocialNetworkWorkerAndUIDefinition,
        SocialNetworkUIDataSources,
        SocialNetworkUITasks,
        SocialNetworkUIInjections,
        SocialNetworkUIInformationCollector,
        SocialNetworkUICustomUI {
    /** Should this UI content script activate? */
    shouldActivate(location?: Location | URL): boolean
    /**
     * A user friendly name for this network.
     */
    friendlyName: string
    /**
     * This function should
     * - Check if Mask has the permission to the site
     */
    hasPermission(): Promise<boolean>
    /**
     * This function should
     * - Request the permission to the site by `browser.permissions.request()`
     */
    requestPermission(): Promise<boolean>
    /**
     * This function should
     * 1. Jump to a new page
     * 2. On that page, shouldDisplayWelcome should return true
     *
     * So Mask will display a Welcome banner
     *
     * If this network is a decentralized network and you don't know which page to open
     * leave a string like `Open the Mastodon instance you want to connect`
     */
    setupAccount: string | ((env: Env, preference: Preference) => void)
    /**
     * Invoked when user click the button to dismiss the setup
     */
    ignoreSetupAccount(env: Env, preference: Preference): void
}
//#endregion
//#region SocialNetworkUIInformationCollector
/**
 * SocialNetworkUIInformationCollector defines what info this UI provider should collect
 */
export interface SocialNetworkUIInformationCollector {
    /**
     * This function should find out which account does user using currently
     * and write it to `SocialNetworkUIDataSources.lastRecognizedIdentity`
     *
     * If this network stores `$self` or `$unknown` into the database, you should also do this
     * ```ts
     * lastRecognizedIdentity.addListener(id => {
     *      if (id.identifier.isUnknown) return
     *      Services.Identity.resolveIdentity(id.identifier)
     * })
     * ```
     *
     * If `selectedIdentity` is null, you should try to set it to an identity in the `myIdentitiesRef`
     *
     * This function expects to fail to collect info.
     */
    resolveLastRecognizedIdentity(): void
    /**
     * This function should inspect the profile page and collect info
     * like avatar, nickname, friendship relation and Mask Key
     */
    collectPeople(): void
    /**
     * This function should collect any possible posts on the page.
     */
    collectPosts(): void
}
//#endregion
//#region SocialNetworkUIInjections
/**
 * SocialNetworkUIInjections defines what UI components this UI provider should inject.
 */
export interface SocialNetworkUIInjections {
    /**
     * This function should inject UI into the Post box
     */
    injectPostBox(): void
    /**
     * This function should inject top toolbar UI
     */
    injectToolbar(): void
    /**
     * This function should inject the setup prompt
     */
    injectSetupPrompt(): void
    /**
     * This function should inject the page inspector
     */
    injectPageInspector(): void
    /**
     * This is an optional function.
     *
     * This function should inject a hint at their bio if they are known by Mask
     */
    injectKnownIdentity?: (() => void) | 'disabled'
    /**
     * This function should inject UI in the search prediction box
     */
    injectSearchPredictionBox?: (() => void) | 'disabled'
    /**
     * This function should inject UI in the main search result box
     */
    injectSearchResultBox?: (() => void) | 'disabled'
    /**
     * This function should inject the comment
     * @param current The current post
     * @returns unmount the injected components
     */
    injectPostComments?: ((current: PostInfo) => () => void) | 'disabled'
    /**
     * This function should inject the comment box
     * @param current The current post
     * @returns unmount the injected components
     */
    injectCommentBox?: ((current: PostInfo) => () => void) | 'disabled'
    /**
     * This function should inject the post replacer
     * @param current The current post
     * @returns unmount the injected components
     */
    injectPostReplacer(current: PostInfo): () => void
    /**
     * This function should inject the post box
     * @param current The current post
     * @returns unmount the injected components
     */
    injectPostInspector(current: PostInfo): () => void
}
//#endregion
//#region SocialNetworkUITasks
/**
 * SocialNetworkUITasks defines the "tasks" this UI provider should execute
 *
 * These tasks may be called directly or call through @dimensiondev/holoflows-kit/AutomatedTabTask
 */
export interface SocialNetworkUITasks {
    /**
     * This function should encode `text` into the base image and upload it to the post box.
     */
    taskUploadToPostBox(
        text: string,
        options: {
            template?: 'v1' | 'v2' | 'v3' | 'v4' | 'eth' | 'dai' | 'okb'
            autoPasteFailedRecover: boolean
            relatedText: string
        },
    ): void

    /**
     * This function should paste `text` into the post box.
     */
    taskPasteIntoPostBox(
        text: string,
        options: {
            autoPasteFailedRecover: boolean
            shouldOpenPostDialog: boolean
        },
    ): void
    /**
     * This function should open the compose box with given post content.
     * If failed, warning user to do it by themselves with `warningText`
     */
    taskOpenComposeBox(
        content: string,
        options?: {
            onlyMySelf?: boolean
            shareToEveryOne?: boolean

            // TODO:
            // after we revamped compose dialog (#1300)
            // payloadType?: string
        },
    ): void
    /**
     * Jump to profile page
     * This task should go to the profile page. The PWA way (no page refreshing) is preferred.
     */
    taskGotoProfilePage(profile: ProfileIdentifier): void
    /**
     * Jump to news feed page
     * This task should go to the news feed page. The PWA way (no page refreshing) is preferred.
     */
    taskGotoNewsFeedPage(): void
    /**
     * This function should return the given single post on the current page,
     * Called by `AutomatedTabTask`
     */
    taskGetPostContent(): Promise<string>
    /**
     * This function should return the profile info on the current page,
     * Called by `AutomatedTabTask`
     * @param identifier The post id
     */
    taskGetProfile(identifier: ProfileIdentifier): Promise<ProfileUI>
    /**
     * For a PersonaIdentifier setup a new account
     */
    taskStartSetupGuide(for_: PersonaIdentifier): void
}

//#endregion
//#region SocialNetworkUIDataSources
/**
 * SocialNetworkUIDataSources defines the data sources this UI provider should provide.
 *
 * These data sources may used in UI components. Make sure you fill the correct information into these sources.
 */
export interface SocialNetworkUIDataSources {
    /**
     * My Mask friends at this network
     */
    readonly friendsRef?: ValueRef<ReadonlyIdentifierMap<ProfileIdentifier, Profile>>
    /**
     * My groups at this network
     */
    readonly groupsRef?: ValueRef<readonly Group[]>
    /**
     * My identities at current network
     */
    readonly myIdentitiesRef?: ValueRef<readonly Profile[]>
    /**
     * The account that user is using (may not in the database)
     */
    readonly lastRecognizedIdentity?: ValueRef<Pick<Profile, 'identifier' | 'nickname' | 'avatar'>>
    /**
     * The account that user is using (MUST be in the database)
     */
    readonly currentIdentity?: ValueRef<Profile | null>
    /**
     * Posts that Mask detects
     */
    readonly posts?: ObservableWeakMap<object, PostInfo>
    /**
     * Typed message metadata
     */
    readonly typedMessageMetadata?: ValueRef<ReadonlyMap<string, any>>
}
//#endregion
//#region SocialNetworkUICustomUI
export interface ComponentOverwriteConfig<Props extends withClasses<any>> {
    classes?: () => Props extends withClasses<infer T> ? Partial<Record<T, string>> : never
    props?: (props: Props) => Props
}
export interface SocialNetworkUICustomUI {
    /**
     * This is a React hook.
     *
     * Should follow the color scheme of the website.
     */
    useTheme?(): Theme
    i18nOverwrite?: {
        [key: string]: Partial<
            {
                [P in keyof I18NStrings]: string
            }
        >
    }
    componentOverwrite?: {
        InjectedDialog?: ComponentOverwriteConfig<InjectedDialogProps>
    }
}
//#endregion

export type SocialNetworkUI = Required<SocialNetworkUIDefinition>

export const definedSocialNetworkUIs = new Set<SocialNetworkUI>()
export const getActivatedUI = () => activatedSocialNetworkUI
export function editActivatedPostMetadata(f: Parameters<typeof editMetadata>[1]) {
    const ref = getActivatedUI().typedMessageMetadata
    ref.value = editMetadata(ref.value, f)
    return ref.value
}

let activatedSocialNetworkUI = ({
    lastRecognizedIdentity: new ValueRef({ identifier: ProfileIdentifier.unknown }),
    currentIdentity: new ValueRef(null),
    myIdentitiesRef: new ValueRef([]),
    useTheme: useMaskbookTheme,
    // Used in SSR (possibly)
    networkIdentifier: 'localhost',
} as Partial<SocialNetworkUI>) as SocialNetworkUI
export function activateSocialNetworkUI(): void {
    for (const ui of definedSocialNetworkUIs)
        if (ui.shouldActivate()) {
            console.log('Activating UI provider', ui.networkIdentifier, ui, 'access it by globalThis.ui')
            Object.assign(globalThis, { ui })
            {
                // Do i18nOverwrite
                for (const lng in ui.i18nOverwrite) {
                    i18nNextInstance.addResourceBundle(lng, 'translation', ui.i18nOverwrite[lng], true, true)
                }
            }
            activatedSocialNetworkUI = ui
            untilDomLoaded().then(() => {
                hookUIPostMap(ui)
                ui.init(env, {})
                ui.resolveLastRecognizedIdentity()
                ui.injectPostBox()
                ui.injectToolbar()
                ui.injectSetupPrompt()
                ui.injectPageInspector()
                ui.collectPeople()
                ui.collectPosts()
                ui.myIdentitiesRef.addListener((val) => {
                    if (val.length === 1) ui.currentIdentity.value = val[0]
                })
                {
                    if (typeof ui.injectSearchResultBox === 'function') ui.injectSearchResultBox()
                    if (Flags.inject_search_prediction_box && typeof ui.injectSearchPredictionBox === 'function')
                        ui.injectSearchPredictionBox()
                }
                {
                    if (typeof ui.injectKnownIdentity === 'function') ui.injectKnownIdentity()
                }
                ui.lastRecognizedIdentity.addListener((id) => {
                    if (id.identifier.isUnknown) return
                    if (isNull(ui.currentIdentity.value)) {
                        ui.currentIdentity.value =
                            ui.myIdentitiesRef.value.find((x) => id.identifier.equals(x.identifier)) || null
                    }
                    Services.Identity.resolveIdentity(id.identifier).then()
                })
            })
            break
        }
}
function hookUIPostMap(ui: SocialNetworkUI) {
    const unmountFunctions = new WeakMap<object, () => void>()
    ui.posts.event.on('set', (key, value) => {
        const unmountPostReplacer = ui.injectPostReplacer(value)
        const unmountPostInspector = ui.injectPostInspector(value)
        const unmountCommentBox: () => void =
            ui.injectCommentBox === 'disabled' ? nopWithUnmount : defaultTo(ui.injectCommentBox, nopWithUnmount)(value)
        const unmountPostComments: () => void =
            ui.injectPostComments === 'disabled'
                ? nopWithUnmount
                : defaultTo(ui.injectPostComments, nopWithUnmount)(value)
        unmountFunctions.set(key, () => {
            unmountPostInspector()
            unmountPostReplacer()
            unmountCommentBox()
            unmountPostComments()
        })
    })
    ui.posts.event.on('delete', (key) => {
        const f = unmountFunctions.get(key)
        f && f()
    })
}

export function defineSocialNetworkUI(UI: SocialNetworkUIDefinition) {
    if (
        (UI.acceptablePayload.includes('v40') || UI.acceptablePayload.includes('v39')) &&
        UI.internalName !== 'facebook'
    ) {
        throw new TypeError('Payload version v40 and v39 is not supported in this network. Please use v38 or newer.')
    }
    if (UI.gunNetworkHint === '' && UI.internalName !== 'facebook') {
        throw new TypeError('For historical reason only Facebook provider can use an empty gunNetworkHint.')
    }
    const res: SocialNetworkUI = {
        ...defaultSharedSettings,
        ...defaultSocialNetworkUI,
        ...UI,
    }
    if (UI.notReadyForProduction) {
        if (process.env.NODE_ENV === 'production') return res
    }
    definedSocialNetworkUIs.add(res)
    return res
}
