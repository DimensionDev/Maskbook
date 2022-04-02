import { MaskMessages } from '../../../../shared/messages'
import { InternalStorageKeys } from '../../../services/settings/utils'
import { prepareSSR } from './prepare-data'
import type { PopupSSR_Props } from './type'

export let cache: { html: string; css: string } = { html: '', css: '' }
export function startListen(
    render: (props: PopupSSR_Props) => Promise<{ html: string; css: string }>,
    signal: AbortSignal,
) {
    async function task() {
        cache = await prepareSSR().then(render)
        console.trace('popup ssr ready.')
    }

    MaskMessages.events.createInternalSettingsChanged.on(console.log, { signal })
    MaskMessages.events.createInternalSettingsUpdated.on(console.log, { signal })
    MaskMessages.events.createInternalSettingsUpdated.on(
        (event) => {
            if (event.initial) return
            if (event.key === InternalStorageKeys.currentPersona || event.key === InternalStorageKeys.language) task()
        },
        { signal },
    )
    task()
}
