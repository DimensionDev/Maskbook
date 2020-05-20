import React, { useState, useCallback, useRef } from 'react'
import {
    Typography,
    styled,
    Theme,
    TextField,
    Fade,
    Box,
    Button,
    makeStyles,
    createStyles,
    ThemeProvider,
    InputBase,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
} from '@material-ui/core'
import classNames from 'classnames'
import DashboardRouterContainer from './Container'
import { useParams, useRouteMatch, Switch, Route, Redirect, Link, useHistory } from 'react-router-dom'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined'
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined'
import ActionButton from '../DashboardComponents/ActionButton'
import { merge, cloneDeep } from 'lodash-es'
import { v4 as uuid } from 'uuid'
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
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { getUrl, unreachable } from '../../../utils/utils'
import { green } from '@material-ui/core/colors'
import { DashboardRoute } from '../Route'
import { useSnackbar } from 'notistack'

export enum SetupStep {
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
            marginTop: 28,
            marginBottom: 10,
        },
        button: {
            width: 220,
            height: 40,
            marginBottom: 20,
        },
        doneButton: {
            color: '#fff',
            backgroundColor: green[500],
            // extra 28 pixel eliminats the visual shaking when switch between pages
            marginBottom: 20 + 28,
            '&:hover': {
                backgroundColor: green[700],
            },
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                createPersonaAndNext()
                            }
                        }}
                        label={t('name')}
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
    const { value: persona = null, loading, error } = useAsync(async () => {
        if (identifier)
            return Services.Identity.queryPersona(Identifier.fromString(identifier, ECKeyIdentifier).unwrap())
        return null
    }, [identifier, personas])

    const deletePersonaAndBack = async () => {
        history.replace(SetupStep.CreatePersona)
        if (persona) await Services.Identity.deletePersona(persona.identifier, 'delete even with private')
    }

    if (error || loading) return null
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
                        onClick={() => history.replace(DashboardRoute.Personas)}>
                        Finish
                    </ActionButton>
                    <ActionButton variant="text" onClick={deletePersonaAndBack}>
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
            pointerEvents: 'none',
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
        button: {
            '& > span:first-child': {
                display: 'inline-block',
                maxWidth: 320,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
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
    alignItems: 'center',
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
    const [file, setFile] = useState<File | null>(null)
    const [bound, { over }] = useDropArea({
        onFiles(files) {
            setFile(files[0])
        },
    })
    const state = useState(0)

    function FileUI() {
        return (
            <div {...bound} style={{ width: '100%' }}>
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
                    <div className={restoreDatabaseClasses.placeholder}></div>
                    <ActionButton
                        className={file ? restoreDatabaseClasses.button : ''}
                        color="primary"
                        variant="text"
                        startIcon={over || file ? null : <AddBoxOutlinedIcon></AddBoxOutlinedIcon>}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}>
                        {over ? t('welcome_1b_dragging') : file ? file.name : 'Drag the file here or browser a file…'}
                    </ActionButton>
                </RestoreBox>
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
                ),
                p: 0,
            },
        ],
        state,
        height: 176,
    }

    const resolveFileInput = useCallback(
        async (str: string) => {
            try {
                const json = UpgradeBackupJSONFile(decompressBackupFile(str))
                if (!json) throw new Error('UpgradeBackupJSONFile failed')
                setJson(json)

                // grant permissions before jump into confirmation page
                const permissions = await extraPermissions(json.grantedHostPermissions)
                if (permissions) {
                    const granted = await browser.permissions.request({ origins: permissions ?? [] })
                    if (!granted) return
                }
                const restoreParams = new URLSearchParams()
                const restoreId = uuid()
                restoreParams.append('personas', String(json.personas?.length ?? ''))
                restoreParams.append('profiles', String(json.profiles?.length ?? ''))
                restoreParams.append('posts', String(json.posts?.length ?? ''))
                restoreParams.append('contacts', String(json.userGroups?.length ?? ''))
                restoreParams.append('date', String(json._meta_?.createdAt ?? ''))
                restoreParams.append('uuid', restoreId)
                await Services.Welcome.restoreBackupAfterConfirmation(restoreId, json)
                history.push(`${SetupStep.RestoreDatabaseConfirmation}?${restoreParams.toString()}`)
            } catch (e) {
                setJson(null)
            }
        },
        [history],
    )
    const resolveFileAndNext = useCallback(() => {
        if (file) {
            const fr = new FileReader()
            fr.readAsText(file)
            fr.addEventListener('loadend', () => resolveFileInput(fr.result as string))
        } else if (textValue) {
            resolveFileInput(textValue)
        }
    }, [file, textValue, resolveFileInput])

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
                        disabled={!(state[0] === 0 && file) && !(state[0] === 1 && textValue)}
                        onClick={resolveFileAndNext}>
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
                    <ActionButton color="primary" variant="text" onClick={() => history.goBack()}>
                        Start From Scratch
                    </ActionButton>
                </>
            }
        />
    )
}
//#endregion

//#region advance restore advance
export function RestoreDatabaseAdvance() {
    const { t } = useI18N()
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
                    <ActionButton variant="text" onClick={() => history.goBack()}>
                        Cancel
                    </ActionButton>
                </>
            }
        />
    )
}
//#endregion

//#region restore database
const useDatabaseRecordStyle = makeStyles((theme: Theme) =>
    createStyles({
        table: {
            width: 432,
            borderRadius: 4,
            borderCollapse: 'unset',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 32,
            marginLeft: -32,
            marginBottom: 38,
        },
        cell: {
            border: 'none',
            padding: '9px 0 !important',
        },
        label: {
            verticalAlign: 'middle',
            fontSize: 20,
            fontWeight: 500,
            lineHeight: '30px',
        },
        icon: {
            color: theme.palette.divider,
            width: 20,
            height: 20,
            verticalAlign: 'middle',
            marginLeft: 18,
        },
        iconChecked: {
            color: theme.palette.success.main,
        },
    }),
)

enum DatabaseRecordType {
    Persona,
    Profile,
    Post,
    Contact,
}

interface DatabasePreviewCardProps {
    records: {
        type: DatabaseRecordType
        length: number
        checked: boolean
    }[]
}

function DatabasePreviewCard(props: DatabasePreviewCardProps) {
    const classes = useDatabaseRecordStyle()

    const resolveRecordName = (type: DatabaseRecordType) => {
        switch (type) {
            case DatabaseRecordType.Persona:
                return 'Personas'
            case DatabaseRecordType.Profile:
                return 'Profiles'
            case DatabaseRecordType.Post:
                return 'Posts'
            case DatabaseRecordType.Contact:
                return 'Contacts'
            default:
                return unreachable(type)
        }
    }
    const records = props.records.map((record) => ({
        ...record,
        name: resolveRecordName(record.type),
    }))
    return (
        <Table className={classes.table} size="small">
            <TableBody>
                {records.map((record) => (
                    <TableRow key={record.name}>
                        <TableCell className={classes.cell} component="th" align="left">
                            <Typography className={classes.label} variant="body2" component="span">
                                {record.name}
                            </Typography>
                        </TableCell>
                        <TableCell className={classes.cell} align="right">
                            <Typography className={classes.label} variant="body2" component="span">
                                {record.length}
                            </Typography>
                            {record.checked ? (
                                <CheckCircleOutlineIcon className={classNames(classes.icon, classes.iconChecked)} />
                            ) : (
                                <RadioButtonUncheckedIcon className={classes.icon} />
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export function RestoreDatabaseConfirmation() {
    const { t } = useI18N()
    const classes = useSetupFormSetyles()
    const history = useHistory()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const [imported, setImported] = useState<boolean | 'loading'>(false)
    const { personas, profiles, posts, contacts, date, uuid } = useQueryParams([
        'personas',
        'profiles',
        'posts',
        'contacts',
        'date',
        'uuid',
    ])

    const time = new Date(date ? Number(date) : 0)
    const records = [
        { type: DatabaseRecordType.Persona, length: Number.parseInt(personas ?? '0'), checked: imported === true },
        { type: DatabaseRecordType.Profile, length: Number.parseInt(profiles ?? '0'), checked: imported === true },
        { type: DatabaseRecordType.Post, length: Number.parseInt(posts ?? '0'), checked: imported === true },
        { type: DatabaseRecordType.Contact, length: Number.parseInt(contacts ?? '0'), checked: imported === true },
    ]

    const restoreConfirmation = async () => {
        const failToRestore = () => {
            closeSnackbar()
            enqueueSnackbar('Restore failed', { variant: 'error' })
        }
        if (uuid) {
            try {
                setImported('loading')
                await Services.Welcome.restoreBackupConfirmation(uuid)
                setImported(true)
            } catch (e) {
                console.error(e)
                failToRestore()
                setImported(false)
            }
        } else {
            failToRestore()
        }
    }

    return (
        <SetupForm
            primary="Restore Database"
            secondary={
                imported === true
                    ? time.getTime() === 0
                        ? 'Unknown time'
                        : t('dashboard_restoration_successful_hint', {
                              time: time.toLocaleString(),
                          })
                    : 'Following data will be imported.'
            }
            content={<DatabasePreviewCard records={records}></DatabasePreviewCard>}
            actions={
                imported === true ? (
                    <ActionButton
                        className={classNames(classes.button, classes.doneButton)}
                        variant="contained"
                        onClick={() => history.replace('/')}>
                        Done
                    </ActionButton>
                ) : (
                    <>
                        <ActionButton
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            disabled={imported === 'loading'}
                            onClick={restoreConfirmation}>
                            Confirm
                        </ActionButton>
                        <ActionButton variant="text" onClick={() => history.goBack()}>
                            Cancel
                        </ActionButton>
                    </>
                )
            }
        />
    )
}
//#endregion

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
                    <ActionButton className={classes.button} variant="text" onClick={() => history.goBack()}>
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
                    lineHeight: 1,
                    paddingTop: 0,
                    paddingBottom: 0,
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
                        <Redirect path="*" to={`${DashboardRoute.Setup}/${SetupStep.CreatePersona}`} />
                    </Route>
                </Switch>
            </ThemeProvider>
        </DashboardRouterContainer>
    )
}
