import { story } from '@masknet/storybook-shared'
import C from '../../../src/pages/Labs/components/PluginItem'
import { action } from '@storybook/addon-actions'

const { meta, of } = story(C)

const Icon = () => <span>icon</span>

export default meta({
    title: 'Pages/Labs/Setting Item',
})

export const SettingItem = of({
    args: {
        title: 'File Service',
        desc: 'Decentralized file storage for users.',
        icon: <Icon />,
        onSwitch: action('onSwitch'),
    },
})
