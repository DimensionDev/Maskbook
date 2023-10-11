import { throttle } from 'lodash-es'
import type { Storage } from 'webextension-polyfill'
import { type EnhanceableSite, MaskMessages, type ProfileAccount } from '@masknet/shared-base'
import { InternalStorageKeys } from '../../../services/settings/utils.js'
import { getCurrentPersonaIdentifier, getLanguage } from '../../../services/settings/index.js'
import { queryOwnedPersonaInformation } from '../../../services/identity/index.js'
import type { PopupSSR_Props } from './type.js'
import { getSupportedSites } from '../../../services/site-adaptors/connect.js'

const CACHE_KEY = 'popup-ssr-cache'
export let cache: {
    html: string
    css: string
} = { html: '', css: '' }
export function startListen(
    render: (props: PopupSSR_Props) => Promise<{
        html: string
        css: string
    }>,
    signal: AbortSignal,
) {
    async function task() {
        cache = await prepareData().then(render)
        if ('session' in browser.storage) {
            ;(browser.storage.session as Storage.StorageArea).set({ [CACHE_KEY]: cache })
        }
        console.log('[Popup SSR] Page ready.', cache)
    }
    const throttledTask = throttle(task, 2000, { leading: true })

    if (!('session' in browser.storage)) {
        throttledTask()
    } else {
        ;(browser.storage.session as Storage.StorageArea).get(CACHE_KEY).then((result) => {
            if (result[CACHE_KEY]) cache = result[CACHE_KEY]
            else throttledTask()
        })
    }
    MaskMessages.events.ownPersonaChanged.on(throttledTask, { signal })
    MaskMessages.events.legacySettings_broadcast.on(
        (event) => {
            if (event.key === InternalStorageKeys.currentPersona || event.key === InternalStorageKeys.language)
                throttledTask()
        },
        { signal },
    )

    return { task, throttledTask }
}

async function prepareData(): Promise<PopupSSR_Props> {
    const language = getLanguage()
    const [id, personas, networks] = await Promise.all([
        getCurrentPersonaIdentifier(),
        queryOwnedPersonaInformation(false),
        getSupportedSites({ isSocialNetwork: true }),
    ])
    const currentPersona = personas.find((x) => x.identifier === id) || personas.at(0)

    return {
        language: await language,
        accounts: currentPersona?.linkedProfiles.map<ProfileAccount>((profile) => ({
            ...profile,
            identity: profile.identifier.userId,
        })),
        avatar: currentPersona?.avatar,
        currentFingerPrint: id?.rawPublicKey,
        hasPersona: !!currentPersona,
        currentPublicKeyHex: id?.publicKeyAsHex,
        linkedProfilesCount: currentPersona?.linkedProfiles.length ?? 0,
        nickname: currentPersona?.nickname,
        networks: networks.map((x) => x.networkIdentifier as EnhanceableSite),
    }
}
