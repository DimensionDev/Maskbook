import { env, SocialNetworkWorkerAndUI } from './shared'
import { ValueRef } from '@holoflows/kit/es'
import { Person } from '../database/helpers/person'
export interface SocialNetworkUI extends SocialNetworkWorkerAndUI, SocialNetworkUIDataSources {
    /** Should this UI content script activate? */
    shouldActivate(): boolean
}
export interface SocialNetworkUIDataSources {
    friendsRef: ValueRef<Person[]>
}

const definedSocialNetworkUIs = new Set<SocialNetworkUI>()
let activatedSocialNetworkUI: SocialNetworkUI = undefined as any
export const getActivatedUI = () => activatedSocialNetworkUI
export function activateSocialNetworkUI() {
    for (const ui of definedSocialNetworkUIs)
        if (ui.shouldActivate()) {
            console.log('Activating UI provider', ui.name, ui)
            ui.init(env, {})
            activatedSocialNetworkUI = ui
        }
}
export function defineSocialNetworkUI<T extends SocialNetworkUI>(UI: T) {
    definedSocialNetworkUIs.add(UI)
}
