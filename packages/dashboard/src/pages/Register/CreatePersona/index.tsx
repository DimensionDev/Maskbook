import { delay } from '@dimensiondev/maskbook-shared'
import { Button, makeStyles, TextField, Typography } from '@material-ui/core'
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Messages, Services } from '../../../API'
import { useDashboardI18N } from '../../../locales/i18n_generated'
import { isPersonaNameLengthValid, PERSONA_NAME_MAX_LENGTH } from '../../../utils/checkLengthExceed'
import { RoutePaths } from '../../routes'
import { ContainerPage } from '../Components/ContainerPage'

const useStyles = makeStyles((theme) => ({
    create: {
        textAlign: 'left',
    },
    title: {},
    name: {
        marginTop: theme.spacing(8),
    },
    confirm: {
        marginTop: theme.spacing(4),
    },
}))

export const CreatePersona = memo(() => {
    const classes = useStyles()
    const t = useDashboardI18N()
    const [name, setName] = useState('')
    const navigate = useNavigate()

    const createPersonaAndNext = async () => {
        const identifier = await Services.Identity.createPersonaByMnemonic(name, '')
        await delay(300)
        Messages.events.personaChanged.sendToAll([{ of: identifier, owned: true, reason: 'new' }])
        navigate(`${RoutePaths.ConnectNetwork}?identifier=${encodeURIComponent(identifier.toText())}`)
    }
    return (
        <ContainerPage>
            <div className={classes.create}>
                <Typography variant="h6" color="textPrimary" align="left">
                    Welcom to Mask Network
                </Typography>
                <Typography variant="body2" color="textSecondary" align="left">
                    You can create personas and connect social accounts
                </Typography>

                <div className={classes.name}>
                    <TextField
                        required
                        fullWidth
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                if (name.length !== 0 && isPersonaNameLengthValid(name)) {
                                    createPersonaAndNext()
                                }
                            }
                        }}
                        error={!isPersonaNameLengthValid(name)}
                        inputProps={{
                            maxLength: PERSONA_NAME_MAX_LENGTH,
                        }}
                        helperText={
                            !isPersonaNameLengthValid(name)
                                ? t.personas_name_maximum_tips({ length: String(PERSONA_NAME_MAX_LENGTH) })
                                : ''
                        }></TextField>
                </div>

                <div className={classes.confirm}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={createPersonaAndNext}
                        disabled={name.length === 0 || !isPersonaNameLengthValid(name)}>
                        Next
                    </Button>
                </div>
            </div>
        </ContainerPage>
    )
})

export default CreatePersona
