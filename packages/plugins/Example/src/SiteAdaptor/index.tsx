/* eslint @masknet/unicode-specific-set: ["error", { "only": "code" }] */
import type { Plugin } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import { Typography } from '@mui/material'
import { base } from '../base.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal) {
        console.debug('Example plugin has been loaded.')
        signal.addEventListener('abort', () => console.debug('Example plugin has been terminated'))
    },
    Widgets: [
        {
            ID: `${PluginID.Example}_example`,
            name: 'example',
            label: 'Example',
            UI: {
                Widget() {
                    return <Typography variant="body1">Example Widget</Typography>
                },
            },
        },
    ],
    // PostInspector: HelloWorld,
    // SearchBox: HelloWorld,
    // DecryptedInspector: HelloWorld,
    // GlobalInjection: GlobalComponent,
    CompositionDialogEntry: {
        label: { fallback: '\uD83E\uDD14 Example' },
        // eslint-disable-next-line no-alert
        onClick: () => alert('It works \u2122!'),
    },
    // CompositionDialogEntry: {
    //     label: '🤣 Example Dialog',
    //     dialog: PluginDialog,
    // },
}

export default site
