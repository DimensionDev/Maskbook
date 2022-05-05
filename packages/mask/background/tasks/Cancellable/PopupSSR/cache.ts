import { throttle } from 'lodash-unified'
import { MaskMessages } from '../../../../shared/messages'
import { InternalStorageKeys } from '../../../services/settings/utils'
import type { PopupSSR_Props } from './type'
import { getCurrentPersonaIdentifier_alternative, getLanguagePreference } from '../../../services/settings'
import { queryOwnedPersonaInformation } from '../../../services/identity'

export let cache: { html: string; css: string } = { html: '', css: '' }
export function startListen(
    render: (props: PopupSSR_Props) => Promise<{ html: string; css: string }>,
    signal: AbortSignal,
) {
    const task = throttle(
        async function task() {
            cache = await prepareData().then(render)
            console.log(cache.html)
        },
        2000,
        { leading: true },
    )
    import.meta.webpackHot?.accept('../../../../src/extension/popups/SSR-server.tsx', () => {
        if (signal.aborted) return
        task()
    })

    task()?.then(() => console.log('[Popup SSR] Page ready.'))
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
    const language = getLanguagePreference()
    const id = await getCurrentPersonaIdentifier_alternative()
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
