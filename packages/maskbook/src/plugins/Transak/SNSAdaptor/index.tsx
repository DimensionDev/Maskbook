import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { BuyTokenDialog } from './BuyTokenDialog'
import { PLUGIN_ICON, PLUGIN_NAME } from '../constants'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <BuyTokenDialog />
    },
    CompositionDialogEntry: {
        dialog: () => {
            return <BuyTokenDialog />
        },
        label: { fallback: `${PLUGIN_ICON} ${PLUGIN_NAME}` },
    },
}

export default sns
