// This file will be virtualized in the future.
// Currently all plugins access the same value, but we can virtualize them in the future.

import type { Subscription } from 'use-subscription'
import type { IdentityResolved } from '../types.js'
import type { NextIDPlatform, PersonaIdentifier, PostIdentifier } from '@masknet/shared-base'

export interface __SiteAdaptorContext__ {
    lastRecognizedProfile: Subscription<IdentityResolved | undefined>
    currentVisitingProfile: Subscription<IdentityResolved | undefined>
    currentNextIDPlatform: NextIDPlatform | undefined
    currentPersonaIdentifier: Subscription<PersonaIdentifier | undefined>
    getPostURL: (identifier: PostIdentifier) => URL | null
    share: undefined | ((text: string) => void)
    getUserIdentity: ((useId: string) => Promise<IdentityResolved | undefined>) | undefined
    getPostIdFromNewPostToast: (() => string) | undefined
    postMessage: ((text: string, options?: any) => Promise<void>) | undefined
    getSearchedKeyword: (() => string) | undefined
    connectPersona: () => Promise<void>
}
export let lastRecognizedProfile: __SiteAdaptorContext__['lastRecognizedProfile']
export let currentVisitingProfile: __SiteAdaptorContext__['currentVisitingProfile']
export let currentNextIDPlatform: NextIDPlatform | undefined
export let currentPersonaIdentifier: __SiteAdaptorContext__['currentPersonaIdentifier']
export let getPostURL: __SiteAdaptorContext__['getPostURL']
export let share: __SiteAdaptorContext__['share']
export let getUserIdentity: __SiteAdaptorContext__['getUserIdentity']
export let getPostIdFromNewPostToast: __SiteAdaptorContext__['getPostIdFromNewPostToast']
export let postMessage: __SiteAdaptorContext__['postMessage']
export let getSearchedKeyword: __SiteAdaptorContext__['getSearchedKeyword']
export let connectPersona: __SiteAdaptorContext__['connectPersona']
export function __setSiteAdaptorContext__(value: __SiteAdaptorContext__) {
    ;({
        lastRecognizedProfile,
        currentVisitingProfile,
        currentNextIDPlatform,
        currentPersonaIdentifier,
        getPostURL,
        share,
        getUserIdentity,
        getPostIdFromNewPostToast,
        postMessage,
        getSearchedKeyword,
        connectPersona,
    } = value)
}
