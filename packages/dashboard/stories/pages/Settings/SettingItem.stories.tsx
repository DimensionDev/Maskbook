import type { Meta } from '@storybook/react'
import component from '../../../src/pages/Settings/components/SettingItem.js'

const Icon = () => <span>icon</span>

export default {
    component,
    title: 'Pages/Settings/Setting Item',
    args: {
        title: 'Title',
        desc: 'description',
        icon: <Icon />,
        children: 'any action component',
    },
} as Meta<typeof component>
