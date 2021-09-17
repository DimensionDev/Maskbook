import { Checkbox as MuiCheckbox, FormControlLabel, FormControlLabelProps } from '@mui/material'
import { story } from '../utils'

function C(props: FormControlLabelProps) {
    return (
        <>
            <FormControlLabel {...props} control={<MuiCheckbox />} label="Checkbox" />
            <FormControlLabel {...props} control={<MuiCheckbox />} disabled label="Checkbox" />
            <FormControlLabel {...props} control={<MuiCheckbox />} checked disabled label="Checkbox" />
        </>
    )
}
const { meta, of } = story(C)
export default meta({
    title: 'Atoms/Checkbox',
    parameters: {},
})

export const Checkbox = of({
    args: {},
})
