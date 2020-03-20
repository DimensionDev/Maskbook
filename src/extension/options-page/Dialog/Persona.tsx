import React, { useState } from 'react'
import { DialogContent } from '@material-ui/core'
import { useInterval } from 'react-use'

export function DashboardPersonaDialog() {
    const [state, setState] = useState(1)
    useInterval(() => setState(state + 1), 1000)
    return <DialogContent>{state}</DialogContent>
}
