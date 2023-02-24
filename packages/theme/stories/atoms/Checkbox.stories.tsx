import type { Meta } from '@storybook/react'
import { FormControlLabel, FormControlLabelProps, Checkbox as MuiCheckbox } from '@mui/material'

function component(props: FormControlLabelProps) {
    return (
        <>
            <FormControlLabel {...props} control={<MuiCheckbox />} label="Checkbox" />
            <FormControlLabel {...props} control={<MuiCheckbox />} disabled label="Checkbox" />
            <FormControlLabel {...props} control={<MuiCheckbox />} checked disabled label="Checkbox" />
        </>
    )
}

export default { component, title: 'Atoms/Checkbox' } as Meta<typeof component>
