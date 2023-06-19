import { story } from '@masknet/storybook-shared'
import C from '../../../src/pages/Settings/components/SettingButton.js'

const { meta, of } = story(C)

function Icon() {
    return <span>icon</span>
}

export default meta({
    title: 'Pages/Settings/Setting Button',
})

export const SettingButton: any = of({
    args: {
        children: 'Button',
    },
})
