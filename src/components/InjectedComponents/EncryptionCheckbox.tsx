import * as React from 'react'
import { FormControlLabel, Checkbox, Typography } from '@material-ui/core'

interface Props {
    onCheck(val: boolean): void
}
export default function(props: Props) {
    return (
        <FormControlLabel
            control={<Checkbox style={{ padding: 0 }} onChange={e => props.onCheck(e.target.checked)} />}
            label={<Typography variant="caption">Encrypt with Maskbook</Typography>}
        />
    )
}
