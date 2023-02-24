import { MiniNetworkSelector as component } from '@masknet/shared'
import type { Meta } from '@storybook/react'

export default {
    component,
    title: 'Components/Mini Network Selector',
    args: {
        networks: [],
        selectedNetwork: null,
        onSelect: () => {},
        hideAllNetworkButton: false,
        disabledNonCurrentNetwork: false,
    },
} as Meta<typeof component>
