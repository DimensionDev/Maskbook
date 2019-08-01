import { env, SocialNetworkWorkerAndUI } from './shared'
import { ValueRef } from '@holoflows/kit/es'
import { Person } from '../database/helpers/person'
import { PostIdentifier, PersonIdentifier } from '../database/type'

export interface SocialNetworkUI extends SocialNetworkWorkerAndUI, SocialNetworkUIDataSources {
    /** Should this UI content script activate? */
    shouldActivate(): boolean
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
     * This function should inject UI into the Post box
     */
    injectPostBox(): void
    /**
     * This function should inspect the profile page and collect info
     * like avatar, nickname, friendship relation and Maskbook Key
     */
    collectPeople(): void
    /**
     * This function should paste `text` into the paste box.
     * If failed, warning user to do it by themselves with `warningText`
     */
    taskPasteIntoPostBox(text: string, warningText: string): Promise<void>
    /**
     * This function should return the given post on the current page,
     * Called by `AutomatedTabTask`
     * @param postIdentifier The post id
     */
    taskGetPostContent(postIdentifier: PostIdentifier<PersonIdentifier>): Promise<string>
}
export interface SocialNetworkUIDataSources {
    friendsRef: ValueRef<Person[]>
    myIdentitiesRef: ValueRef<Person[]>
    /**
     * The account that user is using (may not in the database)
     */
    lastRecognizedIdentity: ValueRef<Pick<Person, 'identifier' | 'nickname' | 'avatar'>>
}

const definedSocialNetworkUIs = new Set<SocialNetworkUI>()
let activatedSocialNetworkUI: SocialNetworkUI = undefined as any
export const getActivatedUI = () => activatedSocialNetworkUI
export function activateSocialNetworkUI() {
    for (const ui of definedSocialNetworkUIs)
        if (ui.shouldActivate()) {
            console.log('Activating UI provider', ui.networkIdentifier, ui)
            ui.init(env, {})
            ui.resolveLastRecognizedIdentity()
            ui.injectPostBox()
            ui.collectPeople()
            activatedSocialNetworkUI = ui
            return
        }
}
export function defineSocialNetworkUI(UI: SocialNetworkUI): void {
    definedSocialNetworkUIs.add(UI)
}
export function defineSocialNetworkUIExtended<T extends SocialNetworkUI>(UI: T): void {
    defineSocialNetworkUI(UI)
}
