import { story } from '@masknet/storybook-shared'
import C from '../../../src/pages/Settings/components/SettingButton'

const { meta, of } = story(C)

const Icon = () => <span>icon</span>

export default meta({
    title: 'Pages/Settings/Setting Button',
})

export const SettingButton = of({
    args: {
        children: 'Button',
    },
})
