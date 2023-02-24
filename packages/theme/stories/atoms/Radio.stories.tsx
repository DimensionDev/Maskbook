import type { Meta } from '@storybook/react'
import { Radio as MuiRadio, RadioGroup, FormControlLabel } from '@mui/material'

function component() {
    return (
        <RadioGroup name="choose">
            <FormControlLabel value="1" control={<MuiRadio />} label="Item 1" />
            <FormControlLabel value="2" control={<MuiRadio />} label="Item 2" />
            <FormControlLabel value="3" control={<MuiRadio />} label="Item 3" />
            <FormControlLabel value="4" disabled control={<MuiRadio />} label="Disabled Item" />
        </RadioGroup>
    )
}

export default { component, title: 'Atoms/Radio' } as Meta<typeof component>
