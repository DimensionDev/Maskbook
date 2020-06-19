import React, { useState, useCallback, ChangeEvent } from 'react'
import {
    Typography,
    Theme,
    TextField,
    Fade,
    Checkbox,
    Link as MuiLink,
    makeStyles,
    createStyles,
    ThemeProvider,
    InputBase,
    FormControlLabel,
} from '@material-ui/core'
import classNames from 'classnames'
import DashboardRouterContainer from './Container'
import { useParams, useRouteMatch, Switch, Route, Redirect, Link, useHistory } from 'react-router-dom'

import ActionButton from '../DashboardComponents/ActionButton'
import { merge, cloneDeep } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import ProfileBox from '../DashboardComponents/ProfileBox'
import Services from '../../service'
import useQueryParams from '../../../utils/hooks/useQueryParams'
import { useAsync } from 'react-use'
import { Identifier, ECKeyIdentifier } from '../../../database/type'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useMyPersonas, useMyUninitializedPersonas } from '../../../components/DataSource/independent'
import { UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import { extraPermissions } from '../../../utils/permissions'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { green } from '@material-ui/core/colors'
import { DashboardRoute } from '../Route'
import { useSnackbar } from 'notistack'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import type { Persona } from '../../../database'
import { RestoreFromQRCodeImageBox } from '../DashboardComponents/RestoreFromQRCodeImageBox'
import { RestoreFromBackupBox } from '../DashboardComponents/RestoreFromBackupBox'
import { DatabaseRecordType, DatabasePreviewCard } from '../DashboardComponents/DatabasePreviewCard'
import { RestoreFromQRCodeCameraBox } from '../DashboardComponents/RestoreFromQRCodeCameraBox'
import { sleep } from '../../../utils/utils'
import { SetupStep } from '../SetupStep'

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
            // extra 36 pixel eliminats the visual shaking when switch between pages
            marginBottom: 20 + 36,
            '&:hover': {
                backgroundColor: green[700],
            },
        },
    }),
)

interface SetupFormProps extends withClasses<KeysInferFromUseStyles<typeof useSetupFormSetyles>> {
    primary: string
    secondary?: string
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
                    {props.secondary ? (
                        <Typography className={classes.secondary} variant="body1">
                            {props.secondary}
                        </Typography>
                    ) : null}
                </div>
                <div className={classes.section}>
                    <form className={classes.form}>{props.content}</form>
                </div>
                <div className={classes.section}>{props.actions}</div>
            </div>
        </Fade>
    )
}
//#endregion

//#region consent data collection
const useConsentDataCollectionStyles = makeStyles((theme) =>
    createStyles({
        form: {
            fontSize: 16,
            lineHeight: 1.75,
            width: 660,
            minHeight: 256,
            marginTop: 78,
        },
        label: {
            marginBottom: 32,
        },
        button: {
            minWidth: 220,
        },
    }),
)

export function ConsentDataCollection() {
    const { t } = useI18N()
    const setupFormClasses = useSetupFormSetyles()
    const consentDataCollection = useConsentDataCollectionStyles()
    const [checked, setChecked] = useState(false)
    return (
        <SetupForm
            classes={{
                form: consentDataCollection.form,
            }}
            primary={t('set_up_consent_data_collection')}
            content={t('set_up_consent_data_collection_hint')}
            actions={
                <>
                    <FormControlLabel
                        className={consentDataCollection.label}
                        control={
                            <Checkbox
                                color="primary"
                                checked={checked}
                                onChange={(ev: ChangeEvent<HTMLInputElement>) => setChecked(ev.target.checked)}
                            />
                        }
                        label={
                            <>
                                {t('set_up_consent_data_collection_privacy_policy_1')}
                                <MuiLink
                                    href="https://maskbook.com/privacy-policy/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    {t('set_up_consent_data_collection_privacy_policy_2')}
                                </MuiLink>
                            </>
                        }
                    />
                    <ActionButton<typeof Link>
                        className={consentDataCollection.button}
                        color="primary"
                        variant="contained"
                        component={Link}
                        disabled={!checked}
                        to={SetupStep.CreatePersona}>
                        {t('set_up_button_get_started')}
                    </ActionButton>
                </>
            }
        />
    )
}
//#endregion

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
            primary={t('set_up_create_persona')}
            secondary={t('set_up_create_persona_hint')}
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
                        inputProps={{
                            'data-testid': 'username_input',
                        }}
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
                        disabled={!name}
                        data-testid="next_button">
                        {t('set_up_button_next')}
                    </ActionButton>
                    <Typography className={setupFormClasses.or} variant="body1">
                        {t('set_up_tip_or')}
                    </Typography>
                    <ActionButton<typeof Link>
                        color="primary"
                        variant="text"
                        component={Link}
                        to={SetupStep.RestoreDatabase}
                        data-testid="backup_button">
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

    const [persona, setPersona] = useState<Persona | null>(null)
    // a restored persona threat as initialized persona
    const initializedPersonas = useMyPersonas()
    const uninitializedPersonas = useMyUninitializedPersonas()
    const { identifier } = useQueryParams(['identifier'])

    const { value = null, loading, error } = useAsync(
        async () =>
            identifier
                ? Services.Identity.queryPersona(Identifier.fromString(identifier, ECKeyIdentifier).unwrap())
                : null,
        [identifier, initializedPersonas, uninitializedPersonas],
    )

    // update persona when link/unlink really happen
    if (!loading && value?.linkedProfiles.size !== persona?.linkedProfiles.size) setPersona(value)

    // prevent from displaying persona's nickname as 'undefined'
    if (!persona?.nickname) return null

    // TODO:
    // show error message

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
                        onClick={async () => {
                            await Promise.all([
                                Services.Identity.setupPersona(persona.identifier),
                                Services.Plugin.invokePlugin('maskbook.wallet', 'importFirstWallet', {
                                    name: persona.nickname ?? t('untitled_wallet'),
                                    mnemonic: persona.mnemonic?.words.split(' '),
                                    passphrase: '',
                                    _wallet_is_default: true,
                                }),
                            ])
                            await sleep(300)
                            history.replace(DashboardRoute.Personas)
                        }}>
                        {t('set_up_button_finish')}
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

//#region restore
const useRestoreDatabaseStyle = makeStyles((theme) =>
    createStyles({
        file: {
            display: 'none',
        },
        input: {
            width: '100%',
            boxSizing: 'border-box',
            border: `solid 1px ${theme.palette.divider}`,
            borderRadius: 4,
            height: 176,
            padding: theme.spacing(2, 3),
            '& > textarea': {
                overflow: 'auto !important',
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

export function RestoreDatabase() {
    const { t } = useI18N()
    const history = useHistory()
    const classes = useSetupFormSetyles()
    const restoreDatabaseClasses = useRestoreDatabaseStyle()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const [file, setFile] = useState<File | null>(null)
    const [backupValue, setBackupValue] = useState('')
    const [textValue, setTextValue] = useState('')

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                id: 'file',
                label: t('restore_database_file'),
                children: (
                    <RestoreFromBackupBox
                        file={file}
                        onChange={(file: File, content: string) => {
                            setFile(file)
                            setBackupValue(content)
                        }}
                    />
                ),
                p: 0,
            },
            {
                id: 'text',
                label: t('restore_database_text'),
                children: (
                    <InputBase
                        className={restoreDatabaseClasses.input}
                        placeholder={t('dashboard_paste_database_backup_hint')}
                        inputRef={(input: HTMLInputElement) => input && input.focus()}
                        multiline
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        inputProps={{
                            'data-testid': 'text_textarea',
                        }}
                    />
                ),
                p: 0,
            },
        ],
        state,
        height: 176,
    }

    const restoreDB = useCallback(
        async (str: string) => {
            try {
                const json = UpgradeBackupJSONFile(decompressBackupFile(str))
                if (!json) throw new Error('UpgradeBackupJSONFile failed')

                // grant permissions before jump into confirmation page
                const permissions = await extraPermissions(json.grantedHostPermissions)
                if (permissions) {
                    const granted = await browser.permissions.request({ origins: permissions ?? [] })
                    if (!granted) return
                }
                const restoreParams = new URLSearchParams()
                const restoreId = uuid()
                restoreParams.append('uuid', restoreId)
                await Services.Welcome.setUnconfirmedBackup(restoreId, json)
                history.push(`${SetupStep.RestoreDatabaseConfirmation}?${restoreParams.toString()}`)
            } catch (e) {
                enqueueSnackbar(t('set_up_restore_fail'), { variant: 'error' })
            }
        },
        [enqueueSnackbar, history, t],
    )

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
                        disabled={!(state[0] === 0 && backupValue) && !(state[0] === 1 && textValue)}
                        onClick={() => restoreDB(state[0] === 0 ? backupValue : textValue)}
                        data-testid="restore_button">
                        {t('set_up_button_restore')}
                    </ActionButton>
                    <ActionButton<typeof Link>
                        className={classes.button}
                        color="primary"
                        variant="outlined"
                        component={Link}
                        to={SetupStep.RestoreDatabaseAdvance}
                        data-testid="advance_button">
                        {t('set_up_button_advance')}
                    </ActionButton>
                    <Typography className={classes.or} variant="body1">
                        {t('set_up_tip_or')}
                    </Typography>
                    <ActionButton
                        color="primary"
                        variant="text"
                        onClick={() => history.goBack()}
                        data-testid="restart_button">
                        {t('set_up_button_from_scratch')}
                    </ActionButton>
                </>
            }
        />
    )
}
//#endregion

//#region advance restore
export function RestoreDatabaseAdvance() {
    const { t } = useI18N()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const history = useHistory()

    const classes = useSetupFormSetyles()

    const [nickname, setNickname] = useState('')
    const [mnemonicWordsValue, setMnemonicWordsValue] = useState('')
    const [password, setPassword] = useState('')
    const [base64Value, setBase64Value] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [scannedValue, setScannedValue] = useState('')

    const state = useState(0)
    const [tabState] = state

    const importPersona = (persona: null | Persona) => {
        const failToRestore = () => enqueueSnackbar(t('set_up_advance_restore_fail'), { variant: 'error' })
        try {
            if (persona) {
                history.push(
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
                            inputProps={{
                                'data-testid': 'username_input',
                            }}
                        />
                        <TextField
                            value={mnemonicWordsValue}
                            onChange={(e) => setMnemonicWordsValue(e.target.value)}
                            required
                            label={t('mnemonic_words')}
                            inputProps={{
                                'data-testid': 'mnemonic_input',
                            }}
                        />
                        <TextField
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            label={t('password')}
                            inputProps={{
                                'data-testid': 'password_input',
                            }}
                        />
                    </>
                ),
                p: 0,
            },
            {
                label: 'Base64',
                children: (
                    <TextField
                        multiline
                        rows={1}
                        placeholder={t('dashboard_paste_database_base64_hint')}
                        onChange={(e) => setBase64Value(e.target.value)}
                        value={base64Value}
                        inputProps={{
                            style: { height: 147 },
                            'data-testid': 'base64_input',
                        }}
                    />
                ),
                display: 'flex',
                p: 0,
            },
            {
                label: t('qr_code'),
                children: (
                    <>
                        <RestoreFromQRCodeImageBox
                            file={file}
                            onChange={setFile}
                            onScan={setScannedValue}
                            onError={() => {
                                enqueueSnackbar(t('set_up_qr_scanner_fail'), {
                                    variant: 'error',
                                })
                            }}
                        />
                        <RestoreFromQRCodeCameraBox
                            onScan={(scannedValue: string) => {
                                setFile(null)
                                setScannedValue(scannedValue)
                            }}
                            onError={() => {
                                enqueueSnackbar(t('set_up_qr_scanner_fail'), {
                                    variant: 'error',
                                })
                            }}
                        />
                    </>
                ),
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
                            !(tabState === 0 && nickname && mnemonicWordsValue) &&
                            !(tabState === 1 && base64Value) &&
                            !(tabState === 2 && scannedValue)
                        }
                        onClick={async () => {
                            try {
                                const persona = await (tabState === 0
                                    ? Services.Identity.restoreFromMnemonicWords(mnemonicWordsValue, nickname, password)
                                    : tabState === 1
                                    ? Services.Identity.restoreFromBase64(base64Value)
                                    : Services.Identity.restoreFromBackup(scannedValue))

                                importPersona(persona)
                            } catch (e) {
                                enqueueSnackbar(t('set_up_advance_restore_fail'), {
                                    variant: 'error',
                                })
                            }
                        }}
                        data-testid="import_button">
                        {t('set_up_button_import')}
                    </ActionButton>
                    <ActionButton variant="text" onClick={() => history.goBack()} data-testid="cancel_button">
                        {t('set_up_button_cancel')}
                    </ActionButton>
                </>
            }
        />
    )
}
//#endregion

//#region restore database confirmation
const useRestoreDatabaseConfirmationStyles = makeStyles((theme: Theme) =>
    createStyles({
        databasePreviewCardTable: {
            width: 432,
            border: `solid 1px ${theme.palette.divider}`,
            borderRadius: 4,
            padding: 32,
            marginTop: 0,
            marginLeft: -32,
            marginBottom: 38,
        },
        databasePreviewCardLabel: {
            fontSize: 18,
        },
        databasePreviewCardIcon: {
            width: 18,
            height: 18,
        },
    }),
)

export function RestoreDatabaseConfirmation() {
    const { t } = useI18N()
    const classes = useSetupFormSetyles()
    const restoreDatabaseConfirmationClasses = useRestoreDatabaseConfirmationStyles()
    const history = useHistory()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const { uuid } = useQueryParams(['uuid'])
    const [imported, setImported] = useState<boolean | 'loading'>(false)

    const { value: backup } = useAsync(() => Services.Welcome.getUnconfirmedBackup(uuid ?? ''))
    const time = new Date(backup?._meta_.createdAt ?? 0)
    const personas = backup?.personas.length ?? 0
    const profiles = backup?.profiles.length ?? 0
    const posts = backup?.posts.length ?? 0
    const contacts = backup?.userGroups.length ?? 0
    const records = [
        { type: DatabaseRecordType.Persona, length: personas, checked: imported === true },
        { type: DatabaseRecordType.Profile, length: profiles, checked: imported === true },
        { type: DatabaseRecordType.Post, length: posts, checked: imported === true },
        { type: DatabaseRecordType.Group, length: contacts, checked: imported === true },
    ]

    const restoreFinish = async () => {
        if (backup?.personas && personas === 1 && profiles === 0) {
            history.push(`${SetupStep.ConnectNetwork}?identifier=${encodeURIComponent(backup.personas[0].identifier)}`)
        } else if (personas === 0 && profiles === 0) {
            history.replace(SetupStep.CreatePersona)
        } else {
            history.replace('/')
        }
    }
    const restoreConfirmation = async () => {
        const failToRestore = () => enqueueSnackbar(t('set_up_restore_fail'), { variant: 'error' })
        if (uuid) {
            try {
                setImported('loading')
                await Services.Welcome.confirmBackup(uuid)
                setImported(true)
            } catch (e) {
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
            content={
                <DatabasePreviewCard
                    classes={{
                        table: restoreDatabaseConfirmationClasses.databasePreviewCardTable,
                        label: restoreDatabaseConfirmationClasses.databasePreviewCardLabel,
                        icon: restoreDatabaseConfirmationClasses.databasePreviewCardIcon,
                    }}
                    records={records}
                />
            }
            actions={
                imported === true ? (
                    <ActionButton
                        className={classNames(classes.button, classes.doneButton)}
                        variant="contained"
                        onClick={restoreFinish}
                        data-testid="finish_button">
                        {t('set_up_button_done')}
                    </ActionButton>
                ) : (
                    <>
                        <ActionButton
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            disabled={imported === 'loading'}
                            onClick={restoreConfirmation}
                            data-testid="confirm_button">
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
        case SetupStep.ConsentDataCollection:
            return <ConsentDataCollection />
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
