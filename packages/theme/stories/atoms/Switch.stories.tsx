import type { Meta } from '@storybook/react'
import { Switch as MuiSwitch, FormControlLabel, SwitchProps } from '@mui/material'

function component(props: SwitchProps) {
    return (
        <>
            <FormControlLabel control={<MuiSwitch {...props} />} label="Switch" />
            <FormControlLabel control={<MuiSwitch disabled />} label="Switch" />
            <FormControlLabel control={<MuiSwitch disabled checked />} label="Switch" />
        </>
    )
}

export default {
    component,
    title: 'Atoms/Switch',
    args: {
        checked: false,
    },
} as Meta<typeof component>
