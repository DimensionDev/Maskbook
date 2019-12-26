import { env, Env, Preference, ProfileUI, SocialNetworkWorkerAndUIDefinition } from './shared'
import { DOMProxy, LiveSelector, ValueRef, OnlyRunInContext } from '@holoflows/kit/es'
import { Group, Profile, Persona } from '../database'
import { ProfileIdentifier, PersonaIdentifier } from '../database/type'
import { Payload } from '../utils/type-transform/Payload'
import { defaultTo, isNull } from 'lodash-es'
import Services from '../extension/service'
import { defaultSharedSettings } from './defaults/shared'
import { defaultSocialNetworkUI } from './defaults/ui'
import { nopWithUnmount } from '../utils/utils'
import { Theme } from '@material-ui/core'
import { MaskbookLightTheme, MaskbookDarkTheme } from '../utils/theme'
import { untilDomLoaded } from '../utils/dom'
import { I18NStrings } from '../utils/i18n'

OnlyRunInContext(['content', 'debugging', 'options'], 'UI provider')

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
     * Should Maskbook show Welcome Banner?
     */
    shouldDisplayWelcome(): Promise<boolean>
    /**
     * A user friendly name for this network.
     */
    friendlyName: string
    /**
     * This function should
     * 0. Request the permission to the site by `browser.permissions.request()`
     */
    requestPermission(): Promise<boolean>
    /**
     * This function should
     * 1. Jump to a new page
     * 2. On that page, shouldDisplayWelcome should return true
     *
     * So Maskbook will display a Welcome banner
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
     * like avatar, nickname, friendship relation and Maskbook Key
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
     * This function should inject the Welcome Banner
     * @description leaving it undefined, there will be a default value
     * leaving it "disabled", Maskbook will disable this feature.
     *
     * If it is a function, it should mount the WelcomeBanner.
     * And it should return a function to unmount the WelcomeBanner
     */
    injectWelcomeBanner?: (() => () => void) | 'disabled'
    /**
     * This is an optional function.
     *
     * This function should inject a link to open the options page.
     *
     * This function should only active when the Maskbook start as a standalone app.
     * (Mobile device).
     */
    injectOptionsPageLink?: (() => void) | 'disabled'
    /**
     * This is an optional function.
     *
     * This function should inject a hint at their bio if they are known by Maskbook
     */
    injectKnownIdentity?: (() => void) | 'disabled'
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
 * These tasks may be called directly or call through @holoflows/kit/AutomatedTabTask
 */
export interface SocialNetworkUITasks {
    /**
     * This function should encode `text` into the base image and upload it to the post box.
     * If failed, warning user to do it by themselves with `warningText`
     */
    taskUploadToPostBox(
        text: string,
        options: {
            warningText: string
        },
    ): void

    /**
     * This function should paste `text` into the post box.
     * If failed, warning user to do it by themselves with `warningText`
     */
    taskPasteIntoPostBox(
        text: string,
        options: {
            warningText: string
            shouldOpenPostDialog: boolean
        },
    ): void
    /**
     * This function should paste `text` into the bio box.
     * If failed, warning user to do it by themselves with automation_request_click_edit_bio_button
     */
    taskPasteIntoBio(text: string): void
    /**
     * Jump to profile page
     * This task should go to the profile page. The PWA way (no page refreshing) is preferred.
     */
    taskGotoProfilePage(profile: ProfileIdentifier): void
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
    taskStartImmersiveSetup(for_: PersonaIdentifier): void
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
     * My Maskbook friends at this network
     */
    readonly friendsRef?: ValueRef<Profile[]>
    /**
     * My groups at this network
     */
    readonly groupsRef?: ValueRef<Group[]>
    /**
     * My identities at current network
     */
    readonly myIdentitiesRef?: ValueRef<Profile[]>
    /**
     * My personas at current network
     */
    readonly myPersonasRef?: ValueRef<Persona[]>
    /**
     * The account that user is using (may not in the database)
     */
    readonly lastRecognizedIdentity?: ValueRef<Pick<Profile, 'identifier' | 'nickname' | 'avatar'>>
    /**
     * The account that user is using (MUST be in the database)
     */
    readonly currentIdentity?: ValueRef<Profile | null>
    /**
     * Posts that Maskbook detects
     */
    readonly posts?: WeakMap<object, PostInfo>
}
export type PostInfo = {
    readonly postBy: ValueRef<ProfileIdentifier>
    readonly postID: ValueRef<string | null>
    readonly postContent: ValueRef<string>
    readonly postPayload: ValueRef<Payload | null>
    readonly steganographyContent: ValueRef<string>
    readonly commentsSelector?: LiveSelector<HTMLElement, false>
    readonly commentBoxSelector?: LiveSelector<HTMLElement, false>
    readonly decryptedPostContent: ValueRef<string>
    readonly rootNode: HTMLElement
    readonly rootNodeProxy: DOMProxy
}
//#endregion
//#region SocialNetworkUICustomUI
export interface SocialNetworkUICustomUI {
    /**
     * This is a React hook.
     *
     * Should follow the color scheme of the website.
     *
     * // Note: useMediaQuery('(prefers-color-scheme: dark)')
     */
    useTheme?(): Theme
    i18nOverwrite?: {
        [key: string]: Partial<
            {
                [P in keyof I18NStrings]: {
                    message: string
                    description?: string
                }
            }
        >
    }
}
//#endregion

export type SocialNetworkUI = Required<SocialNetworkUIDefinition>

export const getEmptyPostInfoByElement = (
    opt: Pick<PostInfo, 'rootNode' | 'rootNodeProxy' | 'commentsSelector' | 'commentBoxSelector'>,
) => {
    return {
        decryptedPostContent: new ValueRef(''),
        postBy: new ValueRef(ProfileIdentifier.unknown, ProfileIdentifier.equals),
        postContent: new ValueRef(''),
        postID: new ValueRef<string | null>(null),
        postPayload: new ValueRef<Payload | null>(null),
        ...opt,
    } as PostInfo
}

export const definedSocialNetworkUIs = new Set<SocialNetworkUI>()
export const getActivatedUI = () => activatedSocialNetworkUI

let activatedSocialNetworkUI = ({
    lastRecognizedIdentity: new ValueRef({ identifier: ProfileIdentifier.unknown }),
    currentIdentity: new ValueRef(null),
    myIdentitiesRef: new ValueRef([] as Profile[]),
    useTheme: () => MaskbookLightTheme,
} as Partial<SocialNetworkUI>) as SocialNetworkUI
export function activateSocialNetworkUI() {
    for (const ui of definedSocialNetworkUIs)
        if (ui.shouldActivate()) {
            console.log('Activating UI provider', ui.networkIdentifier, ui)
            activatedSocialNetworkUI = ui
            return untilDomLoaded().then(() => {
                hookUIPostMap(ui)
                ui.init(env, {})
                ui.resolveLastRecognizedIdentity()
                ui.injectPostBox()
                ui.collectPeople()
                ui.collectPosts()
                ui.myIdentitiesRef.addListener(val => {
                    if (val.length === 1) ui.currentIdentity.value = val[0]
                })
                {
                    const mountSettingsLink = ui.injectOptionsPageLink
                    if (typeof mountSettingsLink === 'function') mountSettingsLink()
                }
                {
                    const mountKnownIdentity = ui.injectKnownIdentity
                    if (typeof mountKnownIdentity === 'function') mountKnownIdentity()
                }
                {
                    const mountBanner = ui.injectWelcomeBanner
                    if (typeof mountBanner === 'function') {
                        ui.shouldDisplayWelcome().then(shouldDisplay => {
                            if (shouldDisplay) {
                                const unmount = mountBanner()
                                ui.myIdentitiesRef.addListener(next => {
                                    ui.shouldDisplayWelcome().then(should => {
                                        !should && next.length && unmount()
                                    })
                                })
                            }
                        })
                    }
                }
                ui.lastRecognizedIdentity.addListener(id => {
                    if (id.identifier.isUnknown) return

                    if (isNull(ui.currentIdentity.value)) {
                        ui.currentIdentity.value =
                            ui.myIdentitiesRef.value.find(x => id.identifier.equals(x.identifier)) || null
                    }
                    Services.Identity.resolveIdentity(id.identifier).then()
                })
            })
        }
}
function hookUIPostMap(ui: SocialNetworkUI) {
    const unmountFunctions = new WeakMap<object, () => void>()
    const setter = ui.posts.set
    ui.posts.set = function(key, value) {
        const unmountPostInspector = ui.injectPostInspector(value)
        const unmountCommentBox: () => void =
            ui.injectCommentBox === 'disabled' ? nopWithUnmount : defaultTo(ui.injectCommentBox, nopWithUnmount)(value)
        const unmountPostComments: () => void =
            ui.injectPostComments === 'disabled'
                ? nopWithUnmount
                : defaultTo(ui.injectPostComments, nopWithUnmount)(value)
        unmountFunctions.set(key, () => {
            unmountPostInspector()
            unmountCommentBox()
            unmountPostComments()
        })
        Reflect.apply(setter, this, [key, value])
        return this
    }
    const remove = ui.posts.delete
    ui.posts.delete = function(key) {
        const f = unmountFunctions.get(key)
        f && f()
        return Reflect.apply(remove, this, [key])
    }
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
