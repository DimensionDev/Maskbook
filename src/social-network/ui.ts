import { env, SocialNetworkWorkerAndUI } from './shared'
import { ValueRef } from '@holoflows/kit/es'
import { Person } from '../database/helpers/person'
export interface SocialNetworkUI extends SocialNetworkWorkerAndUI, SocialNetworkUIDataSources {
    /** Should this UI content script activate? */
    shouldActivate(): boolean
    resolveLastRecognizedIdentity(): void
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
            activatedSocialNetworkUI = ui
            return
        }
}
export function defineSocialNetworkUI<T extends SocialNetworkUI>(UI: T) {
    definedSocialNetworkUIs.add(UI)
}
