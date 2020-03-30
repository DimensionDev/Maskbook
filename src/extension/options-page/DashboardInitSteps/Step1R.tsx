import React from 'react'
import { useDropArea } from 'react-use'
import StepBase from './StepBase'
import { Typography, styled, Theme, makeStyles, createStyles, InputBase } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { Link, useHistory } from 'react-router-dom'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import ActionButton from '../DashboardComponents/ActionButton'
import { decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import Services from '../../service'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import { DatabaseRestoreSuccessDialog, DatabaseRestoreFailedDialog } from '../DashboardDialogs/Database'
import { BackupJSONFileLatest, UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { extraPermissions } from '../../../utils/permissions'
import { InitStep } from '../InitStep'
import QRScanner from '../../../components/QRScanner'
import { hasWKWebkitRPCHandlers } from '../../../utils/iOS-RPC'
import { WKWebkitQRScanner } from '../../../components/shared/qrcode'

const useStyles = makeStyles((theme) =>
    createStyles({
        file: {
            display: 'none',
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
        restoreInputBase: {
            width: '100%',
            flex: 1,
            display: 'flex',
            overflow: 'auto',
            border: `1px solid ${theme.palette.divider}`,
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
    minHeight: 180,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
}))

export default function InitStep1R() {
    const { t } = useI18N()
    const ref = React.useRef<HTMLInputElement>(null)
    const classes = useStyles()
    const [json, setJson] = React.useState<BackupJSONFileLatest | null>(null)
    const [textValue, setTextValue] = React.useState('')
    const [restoreState, setRestoreState] = React.useState<'success' | Error | null>(null)
    const [requiredPermissions, setRequiredPermissions] = React.useState<string[] | null>(null)
    const history = useHistory()

    const header = t('restore_database')

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
                    return await Services.Welcome.restoreBackup(json).then(() =>
                        history.push(`${InitStep.Restore2}?${restoreParams.toString()}`),
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
    const [tabState, setTabState] = state

    function QR() {
        const shouldRenderQRComponent = tabState === 2 && !json

        return shouldRenderQRComponent ? (
            hasWKWebkitRPCHandlers ? (
                <WKWebkitQRScanner onScan={resolveFileInput} onQuit={() => setTabState(0)} />
            ) : (
                <DialogRouter onExit={() => setTabState(0)}>
                    <QRScanner
                        onError={() => setErrorState(new Error('QR Error'))}
                        scanning
                        width="100%"
                        onResult={resolveFileInput}
                    />
                </DialogRouter>
            )
        ) : null
    }

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'File',
                children: <FileUI></FileUI>,
                p: 0,
            },
            {
                label: 'TEXT',
                children: (
                    <div className={classes.restoreTextWrapper}>
                        <InputBase
                            placeholder={t('dashboard_paste_database_backup_hint')}
                            className={classes.restoreInputBase}
                            inputRef={(input: HTMLInputElement) => input && input.focus()}
                            multiline
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}></InputBase>
                        <ActionButton
                            className={classes.restoreActionButton}
                            width={140}
                            variant="contained"
                            onClick={() => resolveFileInput(textValue)}
                            color="primary">
                            {t('restore')}
                        </ActionButton>
                    </div>
                ),
                p: 1,
            },
            {
                label: 'QR',
                children: <QR />,
                p: 0,
            },
        ],
        state,
    }

    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <AbstractTab height={200} {...tabProps}></AbstractTab>
        </div>
    )

    function FileUI() {
        return (
            <div {...bound}>
                <input
                    className={classes.file}
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
                    className={classes.restoreBox}
                    data-active={over}
                    onClick={() => ref.current && ref.current.click()}>
                    {over ? (
                        t('welcome_1b_dragging')
                    ) : file ? (
                        t('welcome_1b_file_selected', { filename: file.name })
                    ) : (
                        <>
                            <ActionButton variant="contained" color="primary" className={classes.restoreBoxButton}>
                                {t('select_file')}
                            </ActionButton>
                            <Typography variant="body2">{t('select_file_hint')}</Typography>
                        </>
                    )}
                </RestoreBox>

                {restoreState === 'success' && (
                    <DialogRouter
                        fullscreen={false}
                        onExit={() => false}
                        children={
                            <DatabaseRestoreSuccessDialog
                                permissions={!!requiredPermissions}
                                onDecline={() => setErrorState(null)}
                                onConfirm={() => {
                                    browser.permissions
                                        .request({ origins: requiredPermissions ?? [] })
                                        .then((granted) =>
                                            granted ? Services.Welcome.restoreBackup(json!) : Promise.reject(),
                                        )
                                        .then(() =>
                                            history.push(
                                                `${InitStep.Restore2}?personas=${json?.personas?.length}&profiles=${json?.profiles?.length}&posts=${json?.posts?.length}&contacts=${json?.userGroups?.length}&date=${json?._meta_?.createdAt}`,
                                            ),
                                        )
                                        .catch(setErrorState)
                                }}
                            />
                        }
                    />
                )}
                {restoreState && restoreState !== 'success' && (
                    <DialogRouter
                        fullscreen={false}
                        children={
                            <DatabaseRestoreFailedDialog onConfirm={() => setRestoreState(null)} error={restoreState} />
                        }
                    />
                )}
            </div>
        )
    }

    const actions = (
        <>
            <ActionButton<typeof Link> variant="outlined" color="default" component={Link} to="start">
                {t('back')}
            </ActionButton>
            <ActionButton<typeof Link>
                variant="outlined"
                color="primary"
                component={Link}
                to={InitStep.RestoreAdvanced1}>
                {t('advanced')}
            </ActionButton>
        </>
    )

    return (
        <StepBase header={header} actions={actions}>
            {content}
        </StepBase>
    )
}
