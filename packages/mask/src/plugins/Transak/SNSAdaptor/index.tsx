import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { BuyTokenDialog } from './BuyTokenDialog'
import { PluginTransakMessages } from '../messages'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationEntry } from '@masknet/shared'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <BuyTokenDialog />
    },
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled }) {
                const { openDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

                return (
                    <ApplicationEntry
                        title="Fiat On-Ramp"
                        disabled={disabled}
                        icon={new URL('../assets/fiat_ramp.png', import.meta.url).toString()}
                        onClick={openDialog}
                    />
                )
            },
            defaultSortingPriority: 9,
        },
    ],
}

export default sns
