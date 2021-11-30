import { ECKeyIdentifier, Identifier, delay } from '@masknet/shared-base'
import { Box, Button, DialogActions, DialogContent, MenuItem, Select, TextField, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useEffect } from 'react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { MaskMessages } from '../../../utils'
import { MissingParameter } from '../MissingParameter'
import { useI18N } from '../../../utils'
import type { SignRequest } from './utils'

export default function SignRequest() {
    const param = useLocation()
    const _ = new URLSearchParams(param.search)
    const message = _.get('message')
    const id = _.get('id')
    const personas = useMyPersonas()
    if (!personas.length) {
        // Let it goes into suspense because personas are still loading
        if (performance.now() < 5000) throw delay(100)
        return <MissingParameter message="There is no persona" />
    }
    if (!message || !id) return <MissingParameter message="Bad sign request" />
    return <SignRequestHandler requestID={id} message={message} />
}

const useStyles = makeStyles()({
    root: { maxWidth: 500, padding: 32, '&>*': { marginBottom: 12 } },
})

function SignRequestHandler(props: SignRequest) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const personas = useMyPersonas()
    const [selected, setSelected] = useState(personas[0].identifier.toText())
    useEffect(() => {
        if (personas.find((x) => x.identifier.toText() === selected)) return
        setSelected(personas[0].identifier.toText())
    }, [selected, personas])
    const onSign = () => {
        MaskMessages.events.signRequestApproved.sendToBackgroundPage({
            requestID: props.requestID,
            selectedPersona: Identifier.fromString<ECKeyIdentifier>(selected, ECKeyIdentifier).unwrap(),
        })
    }
    return (
        <DialogContent className={classes.root}>
            <Typography variant="h3">{t('popups_sign_request')}</Typography>
            <Typography variant="body1">
                <Box sx={{ textDecoration: 'underline', display: 'inline' }} component="span">
                    {t('popups_unkonwn_source')}
                </Box>
                {t('popups_request_sign')}
            </Typography>
            <TextField multiline inputProps={{ readOnly: true }} fullWidth value={props.message} />
            <Typography variant="body1">{t('popups_choose_persona')}</Typography>
            <Select fullWidth value={selected} onChange={(e) => setSelected(e.target.value)}>
                {personas.map((persona) => (
                    <MenuItem selected key={persona.identifier.toText()} value={persona.identifier.toText()}>
                        {persona.nickname ?? persona.fingerprint}
                    </MenuItem>
                ))}
            </Select>
            <DialogActions>
                <Button onClick={window.close}>{t('cancel')}</Button>
                <Button onClick={onSign} variant="contained">
                    {t('sign')}
                </Button>
            </DialogActions>
        </DialogContent>
    )
}
