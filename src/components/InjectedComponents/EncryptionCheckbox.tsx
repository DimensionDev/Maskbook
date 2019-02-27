import * as React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

interface Props {
    onCheck(val: boolean): void
}
export default function(props: Props) {
    return (
        <FormControlLabel
            control={<Checkbox onChange={e => props.onCheck(e.target.checked)} />}
            label="Encrypt with Maskbook"
        />
    )
}
