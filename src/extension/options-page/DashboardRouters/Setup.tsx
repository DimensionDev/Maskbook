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
    Select,
    MenuItem,
    FormControl,
} from '@material-ui/core'
import classNames from 'classnames'
import * as bip39 from 'bip39'
import DashboardRouterContainer from './Container'
import { useParams, useRouteMatch, Switch, Route, Redirect, Link, useHistory } from 'react-router-dom'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined'
import CropFreeIcon from '@material-ui/icons/CropFree'
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
import { getUrl, unreachable, sleep } from '../../../utils/utils'
import { green } from '@material-ui/core/colors'
import { DashboardRoute } from '../Route'
import { useSnackbar } from 'notistack'
import { hasWKWebkitRPCHandlers } from '../../../utils/iOS-RPC'
import { WKWebkitQRScanner } from '../../../components/shared/qrcode'
import QRScanner from '../../../components/QRScanner'
import { decodeArrayBuffer, decodeText } from '../../../utils/type-transform/String-ArrayBuffer'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { PortalShadowRoot } from '../../../utils/jss/ShadowRootPortal'

export enum SetupStep {
    CreatePersona = 'create-persona',
    ConnectNetwork = 'connect-network',
    RestoreDatabase = 'restore-database',
    RestoreDatabaseAdvance = 'restore-database-advance',
    RestoreDatabaseConfirmation = 'restore-database-confirmation',
    RestoreDatabaseSuccessful = 'restore-database-successful',
}

//#region setup form
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
        restoreButton: {
            marginTop: 44,
        },
        importButton: {
            marginTop: 44,
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

interface SetupFormProps extends withClasses<KeysInferFromUseStyles<typeof useSetupFormSetyles>> {
    primary: string
    secondary: string
    content?: React.ReactNode
    actions?: React.ReactNode
}

function SetupForm(props: SetupFormProps) {
    const classes = useStylesExtends(useSetupFormSetyles(), props)
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
//#region

//#region create persona
const userCreatePersonaStyles = makeStyles((theme) =>
    createStyles({
        form: {
            minHeight: 130,
        },
    }),
)

export function CreatePersona() {
    const { t } = useI18N()
    const setupFormClasses = useSetupFormSetyles()
    const createPersonaClasses = userCreatePersonaStyles()
    const [name, setName] = useState('')
    const history = useHistory()

    const createPersonaAndNext = async () => {
        const persona = await Services.Identity.createPersonaByMnemonic(name, '')
        history.push(`${SetupStep.ConnectNetwork}?identifier=${encodeURIComponent(persona.toText())}`)
    }
    return (
        <SetupForm
            classes={{
                form: createPersonaClasses.form,
            }}
            primary={t('set_up_getting_started')}
            secondary={t('set_up_getting_started_hint')}
            content={
                <>
                    <TextField
                        required
                        autoFocus
                        className={setupFormClasses.input}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                createPersonaAndNext()
                            }
                        }}
                        label={t('name')}
                        helperText={' '}
                    />
                </>
            }
            actions={
                <>
                    <ActionButton
                        className={setupFormClasses.button}
                        variant="contained"
                        color="primary"
                        onClick={createPersonaAndNext}
                        disabled={!name}>
                        {t('set_up_button_next')}
                    </ActionButton>
                    <Typography className={setupFormClasses.or} variant="body1">
                        {t('set_up_tip_or')}
                    </Typography>
                    <ActionButton<typeof Link>
                        color="primary"
                        variant="text"
                        component={Link}
                        to={SetupStep.RestoreDatabase}>
                        {t('set_up_button_from_backup')}
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
    const { t } = useI18N()
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
        if (persona) await Services.Identity.deletePersona(persona.identifier, 'delete even with private')
        history.goBack()
    }

    // detect persona's nickname prevent from displaying undefined
    if (loading || !persona?.nickname) return null
    return (
        <SetupForm
            primary={t('set_up_connect', { name: persona.nickname })}
            secondary={t('set_up_connect_hint')}
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
                        {t('set_up_button_finish')}
                    </ActionButton>
                    <ActionButton variant="text" onClick={deletePersonaAndBack}>
                        {t('set_up_button_cancel')}
                    </ActionButton>
                </>
            }
        />
    )
}
//#endregion

//#region restore box
const useRestoreBoxStyles = makeStyles((theme) =>
    createStyles<string, RestoreBoxProps>({
        root: {
            color: theme.palette.text.hint,
            whiteSpace: 'pre-line',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            transition: '0.4s',
            '&[data-active=true]': {
                color: 'black',
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
        placeholder: {
            pointerEvents: 'none',
            width: 64,
            height: 64,
            margin: '0 auto 28px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '64px 64px',
            backgroundImage: (props) => `url(${getUrl(`${props.placeholder}-${theme.palette.type}.png`)})`,
        },
    }),
)

interface RestoreBoxProps extends withClasses<'root' | 'button' | 'placeholder'>, React.HTMLAttributes<HTMLDivElement> {
    file: File | null
    entered: boolean
    enterText: string
    leaveText: string
    placeholder?: string
    children?: React.ReactNode
}

function RestoreBox(props: RestoreBoxProps) {
    const { entered, file, enterText, leaveText, ...restProps } = props
    const classes = useStylesExtends(useRestoreBoxStyles(props), props)

    return (
        <div className={classes.root} {...restProps}>
            <div className={classes.placeholder}></div>
            <ActionButton
                className={file ? classes.button : ''}
                color="primary"
                variant="text"
                startIcon={entered || file ? null : <AddBoxOutlinedIcon />}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}>
                {entered ? enterText : file ? file.name : leaveText}
            </ActionButton>
        </div>
    )
}
//#endregion

//#region restore database
const useRestoreDatabaseStyle = makeStyles((theme) =>
    createStyles({
        file: {
            display: 'none',
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
        const { t } = useI18N()
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
                    file={file}
                    entered={over}
                    enterText={t('restore_database_dragging')}
                    leaveText={t('restore_database_dragged')}
                    placeholder="restore-file-placeholder"
                    data-active={over}
                    onClick={() => ref.current && ref.current.click()}
                />
            </div>
        )
    }

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('restore_database_file'),
                children: (
                    <ShowcaseBox>
                        <FileUI />
                    </ShowcaseBox>
                ),
                p: 0,
            },
            {
                label: t('restore_database_text'),
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
            primary={t('set_up_restore')}
            secondary={t('set_up_restore_hint')}
            content={<AbstractTab {...tabProps}></AbstractTab>}
            actions={
                <>
                    <ActionButton
                        className={classNames(classes.button, classes.restoreButton)}
                        color="primary"
                        variant="contained"
                        disabled={!(state[0] === 0 && file) && !(state[0] === 1 && textValue)}
                        onClick={resolveFileAndNext}>
                        {t('set_up_button_restore')}
                    </ActionButton>
                    <ActionButton<typeof Link>
                        className={classes.button}
                        color="primary"
                        variant="outlined"
                        component={Link}
                        to={SetupStep.RestoreDatabaseAdvance}>
                        {t('set_up_button_advance')}
                    </ActionButton>
                    <Typography className={classes.or} variant="body1">
                        {t('set_up_tip_or')}
                    </Typography>
                    <ActionButton color="primary" variant="text" onClick={() => history.goBack()}>
                        {t('set_up_button_from_scratch')}
                    </ActionButton>
                </>
            }
        />
    )
}
//#endregion

//#region advance restore advance
const useRestoreDatabaseAdvanceStyles = makeStyles((theme) =>
    createStyles({
        showcase: {
            height: 120,
            marginBottom: 16,
        },
        file: {
            display: 'none',
        },
        restoreBoxPlaceholder: {
            marginBottom: 6,
        },
        select: {
            flex: 1,
        },
        button: {
            width: 64,
            minWidth: 'unset',
            padding: 0,
            marginLeft: 16,
        },
    }),
)

export function RestoreDatabaseAdvance() {
    const { t } = useI18N()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const history = useHistory()

    const classes = useSetupFormSetyles()
    const restoreDatabaseAdvanceClasses = useRestoreDatabaseAdvanceStyles()

    const [nickname, setNickname] = useState('')
    const [mnemonicWordsValue, setMnemonicWordsValue] = useState('')
    const [password, setPassword] = useState('')
    const [base64Value, setBase64Value] = useState('')

    const ref = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [bound, { over }] = useDropArea({
        onFiles(files) {
            setFile(files[0])
        },
    })

    const state = useState(0)
    const [tabState, setTabState] = state

    const restorePersona = async (str?: string) => {
        if (tabState === 0) {
            if (!bip39.validateMnemonic(mnemonicWordsValue)) throw new Error('the mnemonic words are not valid')
            const identifier = await Services.Welcome.restoreNewIdentityWithMnemonicWord(mnemonicWordsValue, password, {
                nickname,
            })
            return Services.Identity.queryPersona(identifier)
        } else {
            const object = str
                ? UpgradeBackupJSONFile(decompressBackupFile(str))
                : (JSON.parse(decodeText(decodeArrayBuffer(base64Value))) as BackupJSONFileLatest)
            await Services.Welcome.restoreBackup(object!)
            if (object?.personas?.length) {
                return Services.Identity.queryPersona(
                    Identifier.fromString(object.personas[0].identifier, ECKeyIdentifier).unwrap(),
                )
            }
            return
        }
    }
    const importPersona = async (str?: string) => {
        const failToRestore = () => enqueueSnackbar('Restore failed', { variant: 'error' })
        try {
            const persona = await restorePersona(str)
            if (persona) {
                history.replace(
                    persona.linkedProfiles.size
                        ? DashboardRoute.Personas
                        : `${SetupStep.ConnectNetwork}?identifier=${encodeURIComponent(persona.identifier.toText())}`,
                )
            } else {
                failToRestore()
            }
        } catch (e) {
            failToRestore()
        }
    }

    function QR() {
        const shouldRenderQRComponent = tabState === 2

        return shouldRenderQRComponent ? (
            hasWKWebkitRPCHandlers ? (
                <WKWebkitQRScanner onScan={restorePersona} onQuit={() => setTabState(0)} />
            ) : (
                <QRScanner
                    onError={() => enqueueSnackbar('QRCode scan Failed')}
                    scanning={shouldRenderQRComponent}
                    style={{ maxHeight: 176, width: '100%', borderRadius: 4 }}
                    onResult={restorePersona}
                />
            )
        ) : null
    }

    function QRUI() {
        const { t } = useI18N()
        return (
            <div {...bound} style={{ width: '100%', height: 120 }}>
                <input
                    className={restoreDatabaseAdvanceClasses.file}
                    type="file"
                    accept="application/json"
                    ref={ref}
                    onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                        if (currentTarget.files) {
                            setFile(currentTarget.files.item(0))
                        }
                    }}
                />
                <ShowcaseBox className={restoreDatabaseAdvanceClasses.showcase}>
                    <RestoreBox
                        classes={{ placeholder: restoreDatabaseAdvanceClasses.restoreBoxPlaceholder }}
                        file={file}
                        entered={over}
                        enterText={t('restore_database_advance_dragging')}
                        leaveText={t('restore_database_advance_dragged')}
                        placeholder="restore-image-placeholder"
                        data-active={over}
                        onClick={() => ref.current && ref.current.click()}
                    />
                </ShowcaseBox>
                <Box display="flex" justifyContent="space-between">
                    <FormControl className={restoreDatabaseAdvanceClasses.select} variant="filled">
                        <Select value={10} variant="outlined" MenuProps={{ container: PortalShadowRoot }}>
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={11}>Eleven</MenuItem>
                            <MenuItem value={12}>12</MenuItem>
                        </Select>
                    </FormControl>
                    <Button className={restoreDatabaseAdvanceClasses.button} color="primary" variant="outlined">
                        <CropFreeIcon />
                    </Button>
                </Box>
            </div>
        )
    }

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('mnemonic_words'),
                children: (
                    <>
                        <TextField
                            onChange={(e) => setNickname(e.target.value)}
                            value={nickname}
                            required
                            label={t('name')}
                        />
                        <TextField
                            value={mnemonicWordsValue}
                            onChange={(e) => setMnemonicWordsValue(e.target.value)}
                            required
                            label={t('mnemonic_words')}
                        />
                        <TextField
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            label={t('password')}
                        />
                    </>
                ),
                p: 0,
            },
            {
                label: 'Base64',
                children: (
                    <TextField
                        inputProps={{ style: { height: 147 } }}
                        multiline
                        rows={1}
                        placeholder={t('dashboard_paste_database_base64_hint')}
                        onChange={(e) => setBase64Value(e.target.value)}
                        value={base64Value}></TextField>
                ),
                display: 'flex',
                p: 0,
            },
            {
                label: t('qr_code'),
                children: <QRUI />,
                p: 0,
            },
        ],
        state,
        height: 176,
    }

    return (
        <SetupForm
            primary={t('set_up_advance_restore')}
            secondary={t('set_up_advance_restore_hint')}
            content={<AbstractTab {...tabProps}></AbstractTab>}
            actions={
                <>
                    <ActionButton
                        className={classNames(classes.button, classes.importButton)}
                        variant="contained"
                        color="primary"
                        disabled={
                            !(tabState === 0 && nickname && mnemonicWordsValue) && !(tabState === 1 && base64Value)
                        }
                        onClick={() => importPersona()}>
                        {t('set_up_button_import')}
                    </ActionButton>
                    <ActionButton variant="text" onClick={() => history.goBack()}>
                        {t('set_up_button_cancel')}
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
    const { t } = useI18N()
    const classes = useDatabaseRecordStyle()

    const resolveRecordName = (type: DatabaseRecordType) => {
        switch (type) {
            case DatabaseRecordType.Persona:
                return t('personas')
            case DatabaseRecordType.Profile:
                return t('profiles')
            case DatabaseRecordType.Post:
                return t('posts')
            case DatabaseRecordType.Contact:
                return t('contacts')
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
        const failToRestore = () => enqueueSnackbar('Restore failed', { variant: 'error' })
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
            primary={t('set_up_restore_confirmation')}
            secondary={
                imported === true
                    ? time.getTime() === 0
                        ? t('unknown_time')
                        : t('dashboard_restoration_successful_hint', {
                              time: time.toLocaleString(),
                          })
                    : t('set_up_restore_confirmation_hint')
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
                            {t('set_up_button_confirm')}
                        </ActionButton>
                        <ActionButton variant="text" onClick={() => history.goBack()}>
                            {t('set_up_button_cancel')}
                        </ActionButton>
                    </>
                )
            }
        />
    )
}
//#endregion

export function RestoreDatabaseSuccessful() {
    const { t } = useI18N()
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
                        {t('set_up_button_done')}
                    </ActionButton>
                </>
            }
        />
    )
}

const setupTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {
            MuiOutlinedInput: {
                input: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
                multiline: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
                notchedOutline: {
                    borderColor: '#EAEAEA',
                },
            },
            MuiInputLabel: {
                outlined: {
                    transform: 'translate(14px, 16px) scale(1)',
                },
            },
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
