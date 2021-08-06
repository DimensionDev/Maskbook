// TODO: support wallet sign
// TODO: support sign with given candidate (no choose)

import { Box, Button, DialogActions, MenuItem, Select, TextField, Typography } from '@material-ui/core'
import { delay } from 'opensea-js/lib/utils/utils'
import { useEffect } from 'react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { MissingParameter } from '../MissingParameter'
import type { SignRequest } from './utils'

export default function SignRequest() {
    const param = useLocation()
    const _ = new URLSearchParams(param.search)
    const message = _.get('message')
    const personas = useMyPersonas()
    if (!personas.length) {
        // Let it goes into suspense because personas are still loading
        if (performance.now() < 5000) throw delay(100)
        return <MissingParameter message="There is no persona" />
    }
    if (!message) return <MissingParameter message="Bad sign request" />
    return <SignRequestHandler message={message} />
}

function SignRequestHandler(props: SignRequest) {
    const personas = useMyPersonas()
    const [selected, setSelected] = useState(personas[0].identifier.toText())
    useEffect(() => {
        if (personas.find((x) => x.identifier.toText() === selected)) return
        setSelected(personas[0].identifier.toText())
    }, [selected, personas])
    return (
        <Box sx={{ maxWidth: 500, padding: 4, '&>*': { marginBottom: 2 } }}>
            <Typography variant="h2">Sign request:</Typography>
            <Typography variant="body1">
                <Box sx={{ textDecoration: 'underline', display: 'inline' }} component="span">
                    Unknown source
                </Box>{' '}
                requested to sign the following message with your persona:
            </Typography>
            <TextField multiline inputProps={{ readOnly: true }} fullWidth value={props.message} />
            <Typography variant="body1">Which persona would you like to sign this message?</Typography>
            <Select fullWidth value={selected} onChange={(e) => setSelected(e.target.value)}>
                {personas.map((persona) => (
                    <MenuItem selected key={persona.identifier.toText()} value={persona.identifier.toText()}>
                        {persona.nickname ?? persona.fingerprint}
                    </MenuItem>
                ))}
            </Select>
            <DialogActions>
                <Button>Cancel</Button>
                <Button variant="contained">Sign</Button>
            </DialogActions>
        </Box>
    )
}
