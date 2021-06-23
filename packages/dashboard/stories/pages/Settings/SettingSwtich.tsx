import { story } from '@masknet/storybook-shared'
import C from '../../../src/pages/Settings/components/SettingSwitch'

const { meta, of } = story(C)

const Icon = () => <span>icon</span>

export default meta({
    title: 'Pages/Settings/Setting Switch',
})

export const SettingSwitch = of({
    args: {},
})
