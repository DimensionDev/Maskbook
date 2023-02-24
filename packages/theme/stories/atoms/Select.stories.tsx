import type { Meta } from '@storybook/react'
import { MenuItem, Select as MuiSelect, SelectProps } from '@mui/material'

function component(props: SelectProps) {
    return (
        <MuiSelect {...props}>
            <MenuItem value="1">Test 1</MenuItem>
            <MenuItem value="2">Test 2</MenuItem>
        </MuiSelect>
    )
}

export default {
    component,
    title: 'Atoms/Select',
    args: {
        autoWidth: true,
        defaultValue: '1',
    },
} as Meta<typeof component>
