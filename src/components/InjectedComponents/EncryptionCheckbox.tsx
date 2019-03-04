import * as React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography/Typography'

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
