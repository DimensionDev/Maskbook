import { MuiArgs, story } from '../utils'
import { TooltipProps, Tooltip as MuiTooltip, Button } from '@mui/material'
import { useState } from 'react'

const { meta, of } = story((props: TooltipProps) => {
    const [open, setOpen] = useState(false)
    return (
        <MuiTooltip {...props} open={open}>
            <Button onClick={() => setOpen(!open)}>Trigger</Button>
        </MuiTooltip>
    )
})

export default meta({
    title: 'Atoms/Tooltip',
    argTypes: MuiArgs.tooltip,
})

export const Tooltip = of({
    args: {
        title: 'You must give the lucky drop smart contracts permission to use your DAI. You only have to do this once per token.',
        arrow: true,
        placement: 'top',
    },
})
