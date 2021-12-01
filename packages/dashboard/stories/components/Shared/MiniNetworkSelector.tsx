import { MiniNetworkSelector as C } from '@masknet/shared'
import { story } from '@masknet/storybook-shared'

const { meta, of } = story(C)
export default meta({
    title: 'Components/Mini Network Selector',
})

export const MiniNetworkSelector = of({
    args: {
        networks: [],
        selectedNetwork: null,
        onSelect: () => {},
        hideAllNetworkButton: false,
        disabledNonCurrentNetwork: false,
    },
})
