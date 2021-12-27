import { MiniNetworkSelector as C } from '@masknet/shared'
import { story } from '@masknet/storybook-shared'
import { NetworkType } from '@masknet/web3-shared-evm'

const { meta, of } = story(C)
export default meta({
    title: 'Components/Mini Network Selector',
})

export const MiniNetworkSelector = of({
    args: {
        selectedChainId: 1,
        networks: [NetworkType.Ethereum, NetworkType.Binance, NetworkType.Polygon, NetworkType.xDai, NetworkType.Boba],
        onSelect: () => {},
        hideAllNetworkButton: false,
        disabledNonCurrentNetwork: false,
    },
})
