import { story } from '@masknet/storybook-shared'
import C from '../../../src/pages/Settings/components/SettingItem.js'

const { meta, of } = story(C)

function Icon() {
    return <span>icon</span>
}

export default meta({
    title: 'Pages/Settings/Setting Item',
})

export const SettingItem = of({
    args: {
        title: 'Title',
        desc: 'description',
        icon: <Icon />,
        children: 'any action component',
    },
})
