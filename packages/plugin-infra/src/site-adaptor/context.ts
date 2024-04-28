// This file will be virtualized in the future.
// Currently all plugins access the same value, but we can virtualize them in the future.

import type { Subscription } from 'use-subscription'
import type { IdentityResolved } from '../types.js'
import type { NextIDPlatform, PersonaIdentifier, PostIdentifier, ProfileIdentifier } from '@masknet/shared-base'

export interface __SiteAdaptorContext__ {
    lastRecognizedProfile: Subscription<IdentityResolved | undefined>
    currentVisitingProfile: Subscription<IdentityResolved | undefined>
    currentNextIDPlatform: NextIDPlatform | undefined
    currentPersonaIdentifier: Subscription<PersonaIdentifier | undefined>
    share: undefined | ((text: string, source?: string) => void)
    getPostURL: (identifier: PostIdentifier) => URL | null
    getProfileURL: (identifier: ProfileIdentifier) => URL | null
    getUserIdentity: ((useId: string) => Promise<IdentityResolved | undefined>) | undefined
    getPostIdFromNewPostToast: (() => string) | undefined
    postMessage: ((text: string, options?: any) => Promise<void>) | undefined
    publishPost: ((mediaObjects: Array<string | Blob>, options?: any) => Promise<string | null>) | undefined
    getSearchedKeyword: (() => string) | undefined
    connectPersona: () => Promise<void>
    requestLogin?: (...args: any[]) => void
}
export let lastRecognizedProfile: __SiteAdaptorContext__['lastRecognizedProfile']
export let currentVisitingProfile: __SiteAdaptorContext__['currentVisitingProfile']
export let currentNextIDPlatform: NextIDPlatform | undefined
export let currentPersonaIdentifier: __SiteAdaptorContext__['currentPersonaIdentifier']
export let getPostURL: __SiteAdaptorContext__['getPostURL']
export let getProfileURL: __SiteAdaptorContext__['getProfileURL']
export let share: __SiteAdaptorContext__['share']
export let getUserIdentity: __SiteAdaptorContext__['getUserIdentity']
export let getPostIdFromNewPostToast: __SiteAdaptorContext__['getPostIdFromNewPostToast']
export let postMessage: __SiteAdaptorContext__['postMessage']
export let publishPost: __SiteAdaptorContext__['publishPost']
export let getSearchedKeyword: __SiteAdaptorContext__['getSearchedKeyword']
export let connectPersona: __SiteAdaptorContext__['connectPersona']
export let requestLogin: __SiteAdaptorContext__['requestLogin']
export function __setSiteAdaptorContext__(value: __SiteAdaptorContext__) {
    ;({
        lastRecognizedProfile,
        currentVisitingProfile,
        currentNextIDPlatform,
        currentPersonaIdentifier,
        getPostURL,
        getProfileURL,
        share,
        getUserIdentity,
        getPostIdFromNewPostToast,
        postMessage,
        publishPost,
        getSearchedKeyword,
        connectPersona,
        requestLogin,
    } = value)
}
