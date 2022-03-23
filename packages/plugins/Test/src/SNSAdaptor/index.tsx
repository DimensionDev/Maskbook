import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import TestDialog from './TestDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    CompositionDialogEntry: {
        label: 'aaa',
        dialog: TestDialog,
    },
}

export default sns
