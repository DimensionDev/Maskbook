/* eslint @dimensiondev/unicode/specific-set: ["error", { "only": "code" }] */
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
        label: { i18nKey: '__entry__', fallback: '\u{1F914} Example' },
        onClick: () => alert('It works \u2122!'),
    },
    // CompositionDialogEntry: {
    //     label: '🤣 Example Dialog',
    //     dialog: PluginDialog,
    // },
}

export default sns
