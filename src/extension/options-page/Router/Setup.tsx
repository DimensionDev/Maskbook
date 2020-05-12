import React, { useState, useCallback } from 'react'
import {
    Typography,
    styled,
    Theme,
    CardHeader,
    CardContent,
    CardActions,
    TextField,
    Fade,
    Box,
    Button,
    makeStyles,
    createStyles,
    ThemeProvider,
} from '@material-ui/core'
import DashboardRouterContainer from './Container'
import { useParams, useRouteMatch, Switch, Route, Redirect, Link, useHistory } from 'react-router-dom'
import ActionButton from '../DashboardComponents/ActionButton'
import { merge, cloneDeep } from 'lodash-es'
import ProfileBox from '../DashboardComponents/ProfileBox'
import Services from '../../service'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { useAsync, useMultiStateValidator } from 'react-use'
import { Identifier, ECKeyIdentifier } from '../../../database/type'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useMyPersonas } from '../../../components/DataSource/independent'

enum SetupStep {
    CreatePersona = 'create-persona',
    ConnectNetwork = 'connect-network',
    RestoreDatabase = 'restore-database',
    RestoreDatabaseAdvance = 'restore-database-advance',
    RestoreDatabaseConfirmation = 'restore-database-confirmation',
    RestoreDatabaseSuccessful = 'restore-database-successful',
}

const useSetupFormSetyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        },
        section: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        primary: {
            fontWeight: 500,
            fontSize: 39,
            lineHeight: '37px',
            marginBottom: theme.spacing(2),
        },
        secondary: {
            fontSize: 20,
            lineHeight: 1.5,
            marginBottom: theme.spacing(5),
        },
        form: {
            width: 368,
            minHeight: 200,
        },
        input: {
            width: '100%',
        },
        or: {
            marginTop: 50,
            marginBottom: 10,
        },
        confirm: {
            width: 220,
            height: 40,
            marginBottom: 20,
        },
    }),
)

interface SetupFormProps {
    primary: string
    secondary: string
    content?: React.ReactNode
    actions?: React.ReactNode
}

function SetupForm(props: SetupFormProps) {
    const classes = useSetupFormSetyles()
    return (
        <div className={classes.wrapper}>
            <div className={classes.section}>
                <Typography className={classes.primary} variant="h5">
                    {props.primary}
                </Typography>
                <Typography className={classes.secondary} variant="body1">
                    {props.secondary}
                </Typography>
            </div>
            <div className={classes.section}>
                <form className={classes.form}>{props.content}</form>
            </div>
            <div className={classes.section}>{props.actions}</div>
        </div>
    )
}

//#region create persona
export function CreatePersona() {
    const { t } = useI18N()
    const classes = useSetupFormSetyles()
    const [name, setName] = useState('')
    const history = useHistory()

    //#region validation
    type ValidationResult = [boolean, string]
    type ValidationState = [string]
    const [[isValid, nameErrorMessage]] = useMultiStateValidator<ValidationResult, ValidationState, ValidationResult>(
        [name],
        ([name]: ValidationState): ValidationResult => [Boolean(name), name ? '' : t('error_name_absent')],
    )
    const [submitted, setSubmitted] = useState(false)
    //#endregion

    const createPersonaAndNext = async () => {
        setSubmitted(true)
        if (!isValid) return
        const persona = await Services.Identity.createPersonaByMnemonic(name, '')
        history.push(`${SetupStep.ConnectNetwork}?identifier=${encodeURIComponent(persona.toText())}`)
    }
    return (
        <SetupForm
            primary="Getting Started"
            secondary="You may connect social network profiles to your persona in the next step."
            content={
                <>
                    <TextField
                        required
                        error={submitted && Boolean(nameErrorMessage)}
                        autoFocus
                        className={classes.input}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        label="Name"
                        helperText={(submitted && nameErrorMessage) || ' '}
                    />
                </>
            }
            actions={
                <>
                    <ActionButton
                        className={classes.confirm}
                        variant="contained"
                        color="primary"
                        onClick={createPersonaAndNext}>
                        Next
                    </ActionButton>
                    <Typography className={classes.or} variant="body1">
                        or
                    </Typography>
                    <ActionButton<typeof Link>
                        color="primary"
                        variant="text"
                        component={Link}
                        to={SetupStep.RestoreDatabase}>
                        Restore From Backup
                    </ActionButton>
                </>
            }
        />
    )
}
//#endregion

//#region connect network
const useProviderLineStyle = makeStyles((theme: Theme) => ({
    text: {
        border: `solid 1px ${theme.palette.divider}`,
        borderRadius: 3,
    },
}))

export function ConnectNetwork() {
    const classes = useSetupFormSetyles()
    const history = useHistory()

    const personas = useMyPersonas()
    const { identifier } = useQueryParams(['identifier'])
    const { value: persona = null } = useAsync(async () => {
        if (identifier) {
            return Services.Identity.queryPersona(Identifier.fromString(identifier, ECKeyIdentifier).unwrap())
        }
        return null
    }, [identifier, personas])

    const deletePersona = async () => {
        history.goBack()
        if (persona) {
            await Services.Identity.deletePersona(persona.identifier, 'delete even with private')
        }
    }

    return (
        <SetupForm
            primary="Connect a Social Network Profile"
            secondary="Now Facebook and Twitter are supported."
            content={
                <>
                    <ProfileBox
                        persona={persona}
                        ProviderLineProps={{
                            classes: {
                                ...useProviderLineStyle(),
                            },
                        }}
                    />
                </>
            }
            actions={
                <>
                    <ActionButton
                        className={classes.confirm}
                        variant="contained"
                        color="primary"
                        disabled={persona?.linkedProfiles.size === 0}
                        onClick={() => history.goBack()}>
                        Finish
                    </ActionButton>
                    <ActionButton variant="text" component={Link} onClick={deletePersona}>
                        Cancel
                    </ActionButton>
                </>
            }
        />
    )
}
//#endregion

//#region restore database
export function RestoreDatabase() {
    const classes = useSetupFormSetyles()
    const history = useHistory()
    return (
        <SetupForm
            primary="Restore Database"
            secondary="Restore from a previous database backup."
            content={<></>}
            actions={
                <>
                    <ActionButton className={classes.confirm} disabled variant="contained" color="primary">
                        Restore
                    </ActionButton>
                    <ActionButton<typeof Link>
                        color="primary"
                        variant="text"
                        component={Link}
                        to={SetupStep.RestoreDatabaseAdvance}>
                        Advance...
                    </ActionButton>
                    <Typography className={classes.or} variant="body1">
                        or
                    </Typography>
                    <ActionButton color="primary" variant="text" component={Link} onClick={() => history.goBack()}>
                        Start From Scratch
                    </ActionButton>
                </>
            }
        />
    )
}
//#endregion

export function RestoreDatabaseAdvance() {
    const classes = useSetupFormSetyles()
    const history = useHistory()
    return (
        <SetupForm
            primary="Advanced Restoration Options"
            secondary="You can import a persona backup in the following ways."
            content={<></>}
            actions={
                <>
                    <ActionButton className={classes.confirm} variant="contained" color="primary">
                        Import
                    </ActionButton>
                    <ActionButton color="primary" variant="text" component={Link} onClick={() => history.goBack()}>
                        Cancel
                    </ActionButton>
                </>
            }
        />
    )
}

export function RestoreDatabaseConfirmation() {
    const classes = useSetupFormSetyles()
    const history = useHistory()
    return (
        <SetupForm
            primary="Import Your Persona"
            secondary="Following data will be import."
            content={<></>}
            actions={
                <>
                    <ActionButton className={classes.confirm} variant="contained" color="primary">
                        Import
                    </ActionButton>
                    <ActionButton color="primary" variant="text" component={Link} onClick={() => history.goBack()}>
                        Cancel
                    </ActionButton>
                </>
            }
        />
    )
}

export function RestoreDatabaseSuccessful() {
    const classes = useSetupFormSetyles()
    const history = useHistory()
    return (
        <SetupForm
            primary="Restoration Successful"
            secondary="Restored from a backup at 1/1/1990, 8:45:44 PM."
            content={<></>}
            actions={
                <>
                    <ActionButton
                        className={classes.confirm}
                        variant="text"
                        component={Link}
                        onClick={() => history.goBack()}>
                        Done
                    </ActionButton>
                </>
            }
        />
    )
}

const setupTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {
            MuiTextField: {
                root: {
                    marginTop: theme.spacing(2),
                    marginBottom: 0,

                    '&:first-child': {
                        marginTop: 0,
                    },
                },
            },
            MuiButton: {
                root: {
                    '&[hidden]': {
                        visibility: 'hidden',
                    },
                },
                text: {
                    height: 28,
                },
            },
        },
        props: {
            MuiButton: {
                size: 'medium',
            },
            MuiTextField: {
                fullWidth: true,
                variant: 'outlined',
                margin: 'normal',
            },
        },
    })

const CurrentStep = () => {
    const { step } = useParams()
    switch (step as SetupStep) {
        case SetupStep.ConnectNetwork:
            return <ConnectNetwork />
        case SetupStep.CreatePersona:
            return <CreatePersona />
        case SetupStep.RestoreDatabase:
            return <RestoreDatabase />
        case SetupStep.RestoreDatabaseAdvance:
            return <RestoreDatabaseAdvance />
        case SetupStep.RestoreDatabaseConfirmation:
            return <RestoreDatabaseConfirmation />
        case SetupStep.RestoreDatabaseSuccessful:
            return <RestoreDatabaseSuccessful />
    }
}

export interface DashboardSetupRouterProps {}

export function DashboardSetupRouter(props: DashboardSetupRouterProps) {
    const { path } = useRouteMatch()!
    return (
        <DashboardRouterContainer>
            <ThemeProvider theme={setupTheme}>
                <Switch>
                    <Route path={`${path}/:step`}>
                        <CurrentStep />
                    </Route>
                    <Route path="*">
                        <Redirect path="*" to={`/setup/${SetupStep.CreatePersona}`} />
                    </Route>
                </Switch>
            </ThemeProvider>
        </DashboardRouterContainer>
    )
}
