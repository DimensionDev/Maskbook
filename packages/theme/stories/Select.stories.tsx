import { MenuItem, Select } from '@material-ui/core'
import { story, MuiArgs } from './utils'

const { meta, of } = story(Select)
export default meta({
    title: 'Select',
    argTypes: MuiArgs.select,
})

export const Default = of({
    args: {
        value: 0,
    },
    children: [
        <MenuItem value={0}>Zero</MenuItem>,
        <MenuItem value={1}>One</MenuItem>,
        <MenuItem value={2}>Two</MenuItem>,
        <MenuItem value={2}>Three</MenuItem>,
    ],
})
