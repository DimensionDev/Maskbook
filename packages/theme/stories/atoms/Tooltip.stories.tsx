import type { Meta } from '@storybook/react'
import { MuiArgs } from '../utils/index.js'
import { TooltipProps, Tooltip as MuiTooltip, Button } from '@mui/material'
import { useState } from 'react'

function Component(props: TooltipProps) {
    const [open, setOpen] = useState(false)
    return (
        <MuiTooltip {...props} open={open}>
            <Button onClick={() => setOpen(!open)}>Trigger</Button>
        </MuiTooltip>
    )
}

export default {
    component: Component,
    title: 'Atoms/Tooltip',
    argTypes: MuiArgs.tooltip,
    args: {
        title: 'You must give the lucky drop smart contracts permission to use your DAI. You only have to do this once per token.',
        arrow: true,
        placement: 'top',
    },
} as Meta<typeof Component>
