import { story } from '@masknet/storybook-shared'
import C from '../../../src/pages/Settings/components/SettingSelect'
import { MenuItem } from '@mui/material'

const { meta, of } = story(C)

export default meta({
    title: 'Pages/Settings/Setting Select',
})

export const SettingSelect = of({
    args: {
        value: 1,
        children: <MenuItem value={1}>option 1</MenuItem>,
    },
})
