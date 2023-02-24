import type { Meta } from '@storybook/react'
import { MenuItem } from '@mui/material'
import component from '../../../src/pages/Settings/components/SettingSelect.js'

export default {
    component,
    title: 'Pages/Settings/Setting Select',
    args: {
        value: 1,
        children: <MenuItem value={1}>option 1</MenuItem>,
    },
} as Meta<typeof component>
