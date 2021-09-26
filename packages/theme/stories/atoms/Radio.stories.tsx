import { Radio as MuiRadio, RadioGroup, FormControlLabel, FormControlLabelProps } from '@mui/material'
import { story } from '../utils'

const C = (props: FormControlLabelProps) => {
    return (
        <RadioGroup name="choose">
            <FormControlLabel value="1" control={<MuiRadio />} label="Item 1" />
            <FormControlLabel value="2" control={<MuiRadio />} label="Item 2" />
            <FormControlLabel value="3" control={<MuiRadio />} label="Item 3" />
            <FormControlLabel value="4" disabled control={<MuiRadio />} label="Disabled Item" />
        </RadioGroup>
    )
}
const { meta, of } = story(C)
export default meta({
    title: 'Atoms/Radio',
    parameters: {},
})

export const Radio = of({
    args: {},
})
