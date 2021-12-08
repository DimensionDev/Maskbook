import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {
        console.debug('Example plugin has been loaded.')
        signal.addEventListener('abort', () => console.debug('Example plugin has been terminated'))
    },
    // PostInspector: HelloWorld,
    // SearchBox: HelloWorld,
    // DecryptedInspector: HelloWorld,
    // GlobalInjection: GlobalComponent,
    CompositionDialogEntry: {
        label: { i18nKey: '__entry__', fallback: '🤔 Example' },
        onClick: () => alert('It works ™!'),
    },
    // CompositionDialogEntry: {
    //     label: '🤣 Example Dialog',
    //     dialog: PluginDialog,
    // },
}

export default sns
