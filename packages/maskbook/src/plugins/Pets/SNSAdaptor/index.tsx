import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { AnimatePic } from './animate'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {
        signal.addEventListener('abort', () => console.debug(''))
    },
    GlobalInjection() {
        return <AnimatePic />
    },
    // CompositionDialogEntry: {
    //     label: { i18nKey: '__entry__', fallback: '🤔 Example' },
    //     onClick: () => alert('It works ™!'),
    // },
}

export default sns
