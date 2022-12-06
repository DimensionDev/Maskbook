import { throttle } from 'lodash-es'
import { MaskMessages } from '../../../../shared/messages.js'
import { InternalStorageKeys } from '../../../services/settings/utils.js'
import type { PopupSSR_Props } from './type.js'
import { getCurrentPersonaIdentifier, getLanguage } from '../../../services/settings/index.js'
import { queryOwnedPersonaInformation } from '../../../services/identity/index.js'
import type { Storage } from 'webextension-polyfill'

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
    // @ts-expect-error Chrome Only API
    const session: Storage.StorageArea = browser.storage.session
    async function task() {
        cache = await prepareData().then(render)
        if (process.env.manifest === '3') {
            session.set({ [CACHE_KEY]: cache })
        }
        console.log('[Popup SSR] Page ready.')
    }
    const throttledTask = throttle(task, 2000, { leading: true })

    if (process.env.manifest === '2') {
        throttledTask()
    } else {
        session.get(CACHE_KEY).then((result) => {
            if (result[CACHE_KEY]) cache = result[CACHE_KEY] as any
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
    const id = await getCurrentPersonaIdentifier()
    const personas = await queryOwnedPersonaInformation(false)
    const currentPersona = personas.find((x) => x.identifier === id) || personas.at(0)

    return {
        language: await language,
        avatar: currentPersona?.avatar,
        currentFingerPrint: id?.rawPublicKey,
        hasPersona: !!currentPersona,
        linkedProfilesCount: currentPersona?.linkedProfiles.length ?? 0,
        nickname: currentPersona?.nickname,
    }
}
