import { Switch as MuiSwitch, FormControlLabel, SwitchProps } from '@mui/material'
import { story } from '../utils/index.js'

function C(props: SwitchProps) {
    return (
        <>
            <FormControlLabel control={<MuiSwitch {...props} />} label="Switch" />
            <FormControlLabel control={<MuiSwitch disabled />} label="Switch" />
            <FormControlLabel control={<MuiSwitch disabled checked />} label="Switch" />
        </>
    )
}
const { meta, of } = story(C)
export default meta({
    title: 'Atoms/Switch',
    parameters: {},
})

export const Switch = of({
    args: {
        checked: false,
    },
})
