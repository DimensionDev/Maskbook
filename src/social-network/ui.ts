import { env, SocialNetworkWorkerAndUI, Profile } from './shared'
import { ValueRef } from '@holoflows/kit/es'
import { Person } from '../database/helpers/person'
import { PostIdentifier, PersonIdentifier } from '../database/type'

//#region SocialNetworkUI
export interface SocialNetworkUI
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
}
//#endregion
//#region SocialNetworkUIInformationCollector
/**
 * SocialNetworkUIInformationCollector defines what info this UI provider should collect
 */
interface SocialNetworkUIInformationCollector {
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
     */
    resolveLastRecognizedIdentity(): void
    /**
     * This function should inspect the profile page and collect info
     * like avatar, nickname, friendship relation and Maskbook Key
     */
    collectPeople(): void
}
//#endregion
//#region SocialNetworkUIInjections
/**
 * SocialNetworkUIInjections defines what UI components this UI provider should inject.
 */
interface SocialNetworkUIInjections {
    /**
     * This function should inject UI into the Post box
     */
    injectPostBox(): void
    /**
     * This function should inject the Welcome Banner
     */
    injectWelcomeBanner(): void
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
     * This function should paste `text` into the paste box.
     * If failed, warning user to do it by themselves with `warningText`
     */
    taskPasteIntoPostBox(text: string, warningText: string): Promise<void>
    /**
     * This function should paste `text` into the bio box.
     * If failed, warning user to do it by themselves with automation_request_click_edit_bio_button
     */
    taskPasteIntoBio(text: string): Promise<void>
    /**
     * This function should return the given post on the current page,
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
    friendsRef: ValueRef<Person[]>
    myIdentitiesRef: ValueRef<Person[]>
    /**
     * The account that user is using (may not in the database)
     */
    lastRecognizedIdentity: ValueRef<Pick<Person, 'identifier' | 'nickname' | 'avatar'>>
}
//#endregion

const definedSocialNetworkUIs = new Set<SocialNetworkUI>()
let activatedSocialNetworkUI: SocialNetworkUI = undefined as any
export const getActivatedUI = () => activatedSocialNetworkUI
export function activateSocialNetworkUI() {
    for (const ui of definedSocialNetworkUIs)
        if (ui.shouldActivate()) {
            console.log('Activating UI provider', ui.networkIdentifier, ui)
            activatedSocialNetworkUI = ui
            ui.init(env, {})
            ui.resolveLastRecognizedIdentity()
            ui.injectPostBox()
            ui.collectPeople()
            ui.shouldDisplayWelcome().then(r => r && ui.injectWelcomeBanner())
            return
        }
}
export function defineSocialNetworkUI(UI: SocialNetworkUI): void {
    definedSocialNetworkUIs.add(UI)
}
export function defineSocialNetworkUIExtended<T extends SocialNetworkUI>(UI: T): void {
    defineSocialNetworkUI(UI)
}
