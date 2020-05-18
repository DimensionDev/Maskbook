import React, { useState, useCallback, useRef } from 'react'
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
    InputBase,
} from '@material-ui/core'
import DashboardRouterContainer from './Container'
import { useParams, useRouteMatch, Switch, Route, Redirect, Link, useHistory } from 'react-router-dom'
import ArchiveOutlinedIcon from '@material-ui/icons/ArchiveOutlined'
import StorageIcon from '@material-ui/icons/Storage'
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined'
import ActionButton from '../DashboardComponents/ActionButton'
import { merge, cloneDeep } from 'lodash-es'
import ProfileBox from '../DashboardComponents/ProfileBox'
import Services from '../../service'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { useAsync, useMultiStateValidator, useDropArea } from 'react-use'
import { Identifier, ECKeyIdentifier } from '../../../database/type'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useMyPersonas } from '../../../components/DataSource/independent'
import { BackupJSONFileLatest, UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import { extraPermissions } from '../../../utils/permissions'
import QRScanner from '../../../components/QRScanner'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { getUrl } from '../../../utils/utils'

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
            textAlign: 'center',
            fontWeight: 500,
            fontSize: 39,
            lineHeight: '37px',
            marginBottom: theme.spacing(2),
        },
        secondary: {
            textAlign: 'center',
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
        button: {
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
        <Fade in>
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
        </Fade>
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
        history.replace(`${SetupStep.ConnectNetwork}?identifier=${encodeURIComponent(persona.toText())}`)
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                createPersonaAndNext()
                            }
                        }}
                        label="Name"
                        helperText={(submitted && nameErrorMessage) || ' '}
                    />
                </>
            }
            actions={
                <>
                    <ActionButton
                        className={classes.button}
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
    const providerLineClasses = useProviderLineStyle()
    const history = useHistory()

    const personas = useMyPersonas()
    const { identifier } = useQueryParams(['identifier'])
    const { value: persona = null, loading } = useAsync(async () => {
        if (identifier)
            return Services.Identity.queryPersona(Identifier.fromString(identifier, ECKeyIdentifier).unwrap())
        return null
    }, [identifier, personas])

    const deletePersonaAndBack = async () => {
        history.replace(SetupStep.CreatePersona)
        if (persona) await Services.Identity.deletePersona(persona.identifier, 'delete even with private')
    }

    if (loading) return null
    return (
        <SetupForm
            primary={`Connect a Social Network Profile for "${persona?.nickname}"`}
            secondary="Now Facebook and Twitter are supported."
            content={
                <>
                    <ProfileBox
                        persona={persona}
                        ProviderLineProps={{
                            classes: providerLineClasses,
                        }}
                    />
                </>
            }
            actions={
                <>
                    <ActionButton
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        disabled={persona?.linkedProfiles.size === 0}
                        onClick={() => history.replace('/personas')}>
                        Finish
                    </ActionButton>
                    <ActionButton variant="text" component={Link} onClick={deletePersonaAndBack}>
                        Cancel
                    </ActionButton>
                </>
            }
        />
    )
}
//#endregion

//#region restore database
const useRestoreDatabaseStyle = makeStyles((theme) =>
    createStyles({
        file: {
            display: 'none',
        },
        placeholder: {
            width: 64,
            height: 64,
            margin: '40px auto 28px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '64px 64px',
            backgroundImage: `url(${getUrl(
                theme.palette.type === 'light' ? 'restore-placeholder.png' : 'restore-placeholder-dark.png',
            )})`,
        },
        restoreBox: {
            width: '100%',
            color: 'gray',
            transition: '0.4s',
            '&[data-active=true]': {
                color: 'black',
            },
        },
        restoreBoxButton: {
            alignSelf: 'center',
            width: '180px',
            boxShadow: 'none',
            marginBottom: theme.spacing(1),
        },
        restoreTextWrapper: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        },
        input: {
            width: '100%',
            padding: theme.spacing(2, 3),
            flex: 1,
            display: 'flex',
            overflow: 'auto',
            '& > textarea': {
                height: '100% !important',
            },
        },
        restoreActionButton: {
            alignSelf: 'flex-end',
            marginTop: theme.spacing(1),
        },
    }),
)

const RestoreBox = styled('div')(({ theme }: { theme: Theme }) => ({
    color: theme.palette.text.hint,
    whiteSpace: 'pre-line',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    textAlign: 'center',
    cursor: 'pointer',
}))

const ShowcaseBox = styled('div')(({ theme }: { theme: Theme }) => ({
    overflow: 'auto',
    boxSizing: 'border-box',
    border: `solid 1px ${theme.palette.divider}`,
    display: 'flex',
    justifyContent: 'center',
    height: 176,
    borderRadius: 4,
}))

export function RestoreDatabase() {
    const { t } = useI18N()
    const classes = useSetupFormSetyles()
    const restoreDatabaseClasses = useRestoreDatabaseStyle()
    const history = useHistory()

    const ref = useRef<HTMLInputElement>(null)
    const [textValue, setTextValue] = useState('')
    const [json, setJson] = useState<BackupJSONFileLatest | null>(null)
    const [restoreState, setRestoreState] = useState<'success' | Error | null>(null)
    const [requiredPermissions, setRequiredPermissions] = React.useState<string[] | null>(null)

    const setErrorState = (e: Error | null) => {
        setJson(null)
        setRestoreState(e)
    }

    const resolveFileInput = React.useCallback(
        async (str: string) => {
            try {
                const json = UpgradeBackupJSONFile(decompressBackupFile(str))
                if (!json) throw new Error('UpgradeBackupJSONFile failed')
                setJson(json)
                const permissions = await extraPermissions(json.grantedHostPermissions)
                if (!permissions) {
                    const restoreParams = new URLSearchParams()
                    restoreParams.append('personas', String(json.personas?.length ?? ''))
                    restoreParams.append('profiles', String(json.profiles?.length ?? ''))
                    restoreParams.append('posts', String(json.posts?.length ?? ''))
                    restoreParams.append('contacts', String(json.userGroups?.length ?? ''))
                    restoreParams.append('date', String(json._meta_?.createdAt ?? ''))
                    return await Services.Welcome.restoreBackup(json).then(
                        () => console.log(history),
                        // history.push(`${InitStep.Restore2}?${restoreParams.toString()}`),
                    )
                }
                setRequiredPermissions(permissions)
                setRestoreState('success')
            } catch (e) {
                console.error(e)
                setErrorState(e)
            }
        },
        [history],
    )

    const [file, setFile] = React.useState<File | null>(null)
    const [bound, { over }] = useDropArea({
        onFiles(files) {
            setFile(files[0])
        },
    })

    React.useEffect(() => {
        if (file) {
            const fr = new FileReader()
            fr.readAsText(file)
            fr.addEventListener('loadend', () => resolveFileInput(fr.result as string))
        }
    }, [file, resolveFileInput])

    const state = React.useState(0)

    function FileUI() {
        return (
            <div {...bound}>
                <input
                    className={restoreDatabaseClasses.file}
                    type="file"
                    accept="application/json"
                    ref={ref}
                    onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                        if (currentTarget.files) {
                            setFile(currentTarget.files.item(0))
                        }
                    }}
                />
                <RestoreBox
                    className={restoreDatabaseClasses.restoreBox}
                    data-active={over}
                    onClick={() => ref.current && ref.current.click()}>
                    {over ? (
                        t('welcome_1b_dragging')
                    ) : file ? (
                        t('welcome_1b_file_selected', { filename: file.name })
                    ) : (
                        <>
                            <div className={restoreDatabaseClasses.placeholder}></div>
                            <ActionButton
                                startIcon={<AddBoxOutlinedIcon></AddBoxOutlinedIcon>}
                                component={Link}
                                color="primary"
                                variant="text">
                                drag the file here or browser a file…
                            </ActionButton>
                        </>
                    )}
                </RestoreBox>

                {/* {restoreState === 'success' && (
                    <DatabaseRestoreSuccessDialog
                        permissions={!!requiredPermissions}
                        onDecline={() => setErrorState(null)}
                        onConfirm={() => {
                            browser.permissions
                                .request({ origins: requiredPermissions ?? [] })
                                .then((granted) => (granted ? Services.Welcome.restoreBackup(json!) : Promise.reject()))
                                .then(() =>
                                    history.push(
                                        `${InitStep.Restore2}?personas=${json?.personas?.length}&profiles=${json?.profiles?.length}&posts=${json?.posts?.length}&contacts=${json?.userGroups?.length}&date=${json?._meta_?.createdAt}`,
                                    ),
                                )
                                .catch(setErrorState)
                        }}
                    />
                )}
                {restoreState && restoreState !== 'success' && (
                    <DatabaseRestoreFailedDialog onConfirm={() => setRestoreState(null)} error={restoreState} />
                )} */}
            </div>
        )
    }

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'File',
                children: (
                    <ShowcaseBox>
                        <FileUI></FileUI>
                    </ShowcaseBox>
                ),
                p: 0,
            },
            {
                label: 'Text',
                children: (
                    <ShowcaseBox>
                        <InputBase
                            className={restoreDatabaseClasses.input}
                            placeholder={t('dashboard_paste_database_backup_hint')}
                            inputRef={(input: HTMLInputElement) => input && input.focus()}
                            multiline
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}></InputBase>
                    </ShowcaseBox>

                    // <div className={restoreDatabaseClasses.restoreTextWrapper}>
                    //     <ActionButton
                    //         className={restoreDatabaseClasses.restoreActionButton}
                    //         width={140}
                    //         variant="contained"
                    //         onClick={() => resolveFileInput(textValue)}
                    //         color="primary">
                    //         {t('restore')}
                    //     </ActionButton>
                    // </div>
                ),
                p: 0,
            },
        ],
        state,
        height: 176,
    }
    return (
        <SetupForm
            primary="Restore Database"
            secondary="Restore from a previous database backup."
            content={<AbstractTab {...tabProps}></AbstractTab>}
            actions={
                <>
                    <ActionButton
                        className={classes.button}
                        style={{ marginTop: 44 }}
                        color="primary"
                        variant="contained"
                        disabled>
                        Restore
                    </ActionButton>
                    <ActionButton<typeof Link>
                        className={classes.button}
                        color="primary"
                        variant="outlined"
                        component={Link}
                        to={SetupStep.RestoreDatabaseAdvance}>
                        Advance…
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
                    <ActionButton className={classes.button} variant="contained" color="primary">
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
                    <ActionButton className={classes.button} variant="contained" color="primary">
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
                        className={classes.button}
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
            MuiPaper: {
                root: {
                    backgroundColor: 'transparent',
                },
            },
            MuiTabs: {
                root: {
                    minHeight: 38,
                },
                indicator: {
                    height: 1,
                },
            },
            MuiTab: {
                root: {
                    minHeight: 38,
                    borderBottom: `solid 1px ${theme.palette.divider}`,
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
        case SetupStep.CreatePersona:
            return <CreatePersona />
        case SetupStep.ConnectNetwork:
            return <ConnectNetwork />
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

const CurrentStepFade = () => (
    <Fade in>
        <CurrentStep />
    </Fade>
)

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
