/* eslint @dimensiondev/unicode/specific-set: ["error", { "only": "code" }] */
import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {
        console.debug('Example plugin has been loaded.')
        signal.addEventListener('abort', () => console.debug('Example plugin has been terminated'))
    },
    ContributedView: {
        example: {
            component() {
                return <h1>Test</h1>
            },
        },
    },
    // PostInspector: HelloWorld,
    // SearchBox: HelloWorld,
    // DecryptedInspector: HelloWorld,
    // GlobalInjection: GlobalComponent,
    CompositionDialogEntry: {
        label: { i18nKey: '__entry__', fallback: '\uD83E\uDD14 Example' },
        onClick: () => alert('It works \u2122!'),
    },
    // CompositionDialogEntry: {
    //     label: '🤣 Example Dialog',
    //     dialog: PluginDialog,
    // },
}

export default sns
