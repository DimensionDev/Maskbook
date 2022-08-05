import { MenuItem, Select as MuiSelect, SelectProps } from '@mui/material'
import { story } from '../utils'

const { meta, of } = story((props: SelectProps) => {
    return (
        <MuiSelect {...props}>
            <MenuItem value="1">Test 1</MenuItem>
            <MenuItem value="2">Test 2</MenuItem>
        </MuiSelect>
    )
})

export default meta({
    title: 'Atoms/Select',
    argTypes: {},
})

export const Select = of({
    args: {
        autoWidth: true,
        defaultValue: '1',
    },
})
