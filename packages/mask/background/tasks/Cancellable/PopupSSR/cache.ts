import { throttle } from 'lodash-unified'
import { MaskMessages } from '../../../../shared/messages'
import { InternalStorageKeys } from '../../../services/settings/utils'
import type { PopupSSR_Props } from './type'
import { getCurrentPersonaIdentifier, getLanguage } from '../../../services/settings'
import { queryOwnedPersonaInformation } from '../../../services/identity'

const CACHE_KEY = 'popup-ssr-cache'
export let cache: { html: string; css: string } = { html: '', css: '' }
export function startListen(
    render: (props: PopupSSR_Props) => Promise<{ html: string; css: string }>,
    signal: AbortSignal,
) {
    const task = throttle(
        async function task() {
            cache = await prepareData().then(render)
            if (process.env.manifest === '3') {
                browser.storage.session.set({ [CACHE_KEY]: cache })
            }
        },
        2000,
        { leading: true },
    )
    import.meta.webpackHot?.accept('../../../../src/extension/popups/SSR-server.tsx', () => {
        if (signal.aborted) return
        task()
    })

    if (process.env.manifest === '2') {
        task()?.then(() => console.log('[Popup SSR] Page ready.'))
    } else {
        browser.storage.session
            .get(CACHE_KEY)
            .then((result) => {
                if (result[CACHE_KEY]) return (cache = result[CACHE_KEY] as any)
                else return task()
            })
            .then(() => console.log('[Popup SSR] Page ready.'))
    }
    MaskMessages.events.ownPersonaChanged.on(task, { signal })
    MaskMessages.events.createInternalSettingsUpdated.on(
        (event) => {
            if (event.initial) return
            if (event.key === InternalStorageKeys.currentPersona || event.key === InternalStorageKeys.language) task()
        },
        { signal },
    )
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
