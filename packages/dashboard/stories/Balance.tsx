import { story } from '@dimensiondev/maskbook-storybook-shared'
import { Balance as C } from '../src/components/Balance'
import { action } from '@storybook/addon-actions'
const { meta, of } = story(C)

export default meta({ title: '/Components/Balance' })

export const Balance = of({
    args: {
        balance: 9000000,
        onBuy: action('onBuy'),
        onSend: action('onSend'),
        onSwap: action('onSwap'),
        onReceive: action('onReceive'),
    },
})
