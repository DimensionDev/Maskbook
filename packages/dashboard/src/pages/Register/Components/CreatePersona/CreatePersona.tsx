import { MaskNotSquareIcon } from '@dimensiondev/icons'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { Button, Link, makeStyles, TextField, Typography } from '@material-ui/core'
import { memo, useState } from 'react'
import { Services } from '../../../../API'
import { useDashboardI18N } from '../../../../locales/i18n_generated'
import { isPersonaNameLengthValid, PERSONA_NAME_MAX_LENGTH } from '../../../../utils/checkLengthExceed'

const useStyles = makeStyles((theme) => ({
    container: {
        height: '100vh',
        display: 'flex',
    },
    leftContainer: {
        width: 500,
        backgroundColor: MaskColorVar.blue,
        paddingTop: theme.spacing(4),
        paddingLeft: theme.spacing(2),
    },
    rightContainer: {
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    goback: {
        textAlign: 'right',
        paddingTop: theme.spacing(8),
        paddingRight: theme.spacing(8),
        fontSize: 13,
        outline: 'none',
    },
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
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

    const createPersonaAndNext = async () => {
        const persona = await Services.Identity.createPersonaByMnemonic(name, '')
    }
    return (
        <div className={classes.container}>
            <div className={classes.leftContainer}>
                <MaskNotSquareIcon />
            </div>
            <div className={classes.rightContainer}>
                <div className={classes.goback}>
                    <Link>Go back</Link>
                </div>
                <div className={classes.wrapper}>
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
                                    maxlength: PERSONA_NAME_MAX_LENGTH,
                                    'data-testid': 'username_input',
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
                </div>
            </div>
        </div>
    )
})
