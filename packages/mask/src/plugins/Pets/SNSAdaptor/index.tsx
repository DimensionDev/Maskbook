import { Plugin, ApplicationEntryConduct, NetworkPluginID } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { PLUGIN_APPLICATION_CATEGORIES } from '../../EVM/constants'
import { base } from '../base'
import AnimatePic from './Animate'
import { PetDialog } from './PetDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection() {
        return (
            <>
                <AnimatePic />
                <PetDialog />
            </>
        )
    },
    ApplicationEntries: [
        {
            icon: new URL('../assets/mintTeam.png', import.meta.url),
            label: 'Non-F Friends',
            priority: 11,
            displayLevel: 2,
            categoryID: PLUGIN_APPLICATION_CATEGORIES[0].ID,
            conduct: { type: ApplicationEntryConduct.Custom },
            supportedNetworkList: [{ network: NetworkPluginID.PLUGIN_EVM, chainIdList: [ChainId.Mainnet] }],
            walletRequired: true,
        },
    ],
}

export default sns
