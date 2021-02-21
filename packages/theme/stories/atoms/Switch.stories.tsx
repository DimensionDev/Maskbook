import { Switch as MuiSwitch, FormControlLabel } from '@material-ui/core'
import { story, MuiArgs, matrix } from '../utils'

function C() {
    return (
        <>
            <FormControlLabel control={<MuiSwitch />} label="Switch" />
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

export const Switch = of({})
