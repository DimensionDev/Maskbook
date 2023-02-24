import type { Meta } from '@storybook/react'
import component from '../../../src/pages/Settings/components/SettingButton.js'

export default {
    component,
    title: 'Pages/Settings/Setting Button',
    args: {
        children: 'Button',
    },
} as Meta<typeof component>
