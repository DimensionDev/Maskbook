import { env, Env, Preference, Profile, SocialNetworkWorkerAndUI } from './shared'
import { DomProxy, LiveSelector, ValueRef } from '@holoflows/kit/es'
import { Person, Group } from '../database'
import { PersonIdentifier, PostIdentifier } from '../database/type'
import { Payload } from '../utils/type-transform/Payload'
import { isNull } from 'lodash-es'
import Services from '../extension/service'
import { defaultUIInject } from './defaults/inject'
import { defaultSharedSettings } from './defaults/shared'

//#region SocialNetworkUI
export interface SocialNetworkUIDefinition
    extends SocialNetworkWorkerAndUI,
        SocialNetworkUIDataSources,
        SocialNetworkUITasks,
        SocialNetworkUIInjections,
        SocialNetworkUIInformationCollector {
    /** Should this UI content script activate? */
    shouldActivate(): boolean
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
     *      Services.People.resolveIdentity(id.identifier)
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
     */
    injectWelcomeBanner(): void
    /**
     * This function should inject the comment
     * @param current The current post
     * @param node The post root
     * @returns unmount the injected components
     */
    injectPostComments?(current: PostInfo, node: DomProxy): () => void
    /**
     * This function should inject the comment box
     * @param current The current post
     * @param node The post root
     * @returns unmount the injected components
     */
    injectCommentBox?(current: PostInfo, node: DomProxy): () => void
    /**
     * This function should inject the post box
     * @param current The current post
     * @param node The post root
     * @returns unmount the injected components
     */
    injectPostInspector(current: PostInfo, node: DomProxy<HTMLElement>): () => void
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
     * This function should return the given single post on the current page,
     * Called by `AutomatedTabTask`
     * @param postIdentifier The post id
     */
    taskGetPostContent(postIdentifier: PostIdentifier<PersonIdentifier>): Promise<string>
    /**
     * This function should return the profile info on the current page,
     * Called by `AutomatedTabTask`
     * @param identifier The post id
     */
    taskGetProfile(identifier: PersonIdentifier): Promise<Profile>
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
    readonly friendsRef: ValueRef<Person[]>
    /**
     * My groups at this network
     */
    readonly groupsRef: ValueRef<Group[]>
    /**
     * My identities at current network
     */
    readonly myIdentitiesRef: ValueRef<Person[]>
    /**
     * The account that user is using (may not in the database)
     */
    readonly lastRecognizedIdentity: ValueRef<Pick<Person, 'identifier' | 'nickname' | 'avatar'>>
    /**
     * The account that user is using (MUST be in the database)
     */
    readonly currentIdentity: ValueRef<Person | null>
    /**
     * Posts that Maskbook detects
     */
    readonly posts: WeakMap<DomProxy, PostInfo>
}
export type PostInfo = {
    readonly postBy: ValueRef<PersonIdentifier>
    readonly postID: ValueRef<string | null>
    readonly postContent: ValueRef<string>
    readonly postPayload: ValueRef<Payload | null>
    readonly commentsSelector?: LiveSelector<HTMLElement, false>
    readonly commentBoxSelector?: LiveSelector<HTMLElement, true>
    readonly decryptedPostContent: ValueRef<string>
    readonly rootNode: HTMLElement
}
//#endregion

export type SocialNetworkUI = Required<SocialNetworkUIDefinition>

export const getEmptyPostInfo = (rootNodeSelector: LiveSelector<HTMLElement, true>) => {
    return {
        decryptedPostContent: new ValueRef(''),
        postBy: new ValueRef(PersonIdentifier.unknown),
        postContent: new ValueRef(''),
        postID: new ValueRef(''),
        postPayload: new ValueRef(null),
        get rootNode() {
            return rootNodeSelector.evaluate()
        },
    } as PostInfo
}

export const definedSocialNetworkUIs = new Set<SocialNetworkUI>()
let activatedSocialNetworkUI: SocialNetworkUI = ({
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    currentIdentity: new ValueRef(null),
    myIdentitiesRef: new ValueRef([]),
} as Partial<SocialNetworkUI>) as any
export const getActivatedUI = () => activatedSocialNetworkUI
export function activateSocialNetworkUI() {
    for (const ui of definedSocialNetworkUIs)
        if (ui.shouldActivate()) {
            console.log('Activating UI provider', ui.networkIdentifier, ui)
            activatedSocialNetworkUI = ui
            hookUIPostMap(ui)
            ui.init(env, {})
            ui.resolveLastRecognizedIdentity()
            ui.injectPostBox()
            ui.collectPeople()
            ui.collectPosts()
            ui.myIdentitiesRef.addListener(val => {
                if (val.length === 1) ui.currentIdentity.value = val[0]
            })
            ui.shouldDisplayWelcome().then(r => r && ui.injectWelcomeBanner())
            ui.lastRecognizedIdentity.addListener(id => {
                if (id.identifier.isUnknown) return

                if (isNull(ui.currentIdentity.value)) {
                    ui.currentIdentity.value =
                        ui.myIdentitiesRef.value.find(x => id.identifier.equals(x.identifier)) || null
                }
                Services.People.resolveIdentity(id.identifier).then()
            })
            return
        }
}
function hookUIPostMap(ui: SocialNetworkUI) {
    const undoMap = new WeakMap<object, () => void>()
    const setter = ui.posts.set
    ui.posts.set = function(key, value) {
        const undo1 = ui.injectPostInspector(value, key)
        const undo2 = ui.injectCommentBox(value, key)
        const undo3 = ui.injectPostComments(value, key)
        undoMap.set(key, () => {
            undo1()
            undo2()
            undo3()
        })
        Reflect.apply(setter, this, [key, value])
        return this
    }
    const remove = ui.posts.delete
    ui.posts.delete = function(key) {
        const f = undoMap.get(key)
        f && f()
        return Reflect.apply(remove, this, [key])
    }
}

export function defineSocialNetworkUI(UI: SocialNetworkUIDefinition) {
    if (UI.acceptablePayload.includes('v40') && UI.internalName !== 'facebook') {
        throw new TypeError('Payload version v40 is not supported in this network. Please use v39 or newer.')
    }
    const res: SocialNetworkUI = {
        ...defaultSharedSettings,
        ...defaultUIInject,
        ...UI,
    }
    if (UI.notReadyForProduction) {
        if (process.env.NODE_ENV === 'production') return res
    }
    definedSocialNetworkUIs.add(res)
    return res
}
