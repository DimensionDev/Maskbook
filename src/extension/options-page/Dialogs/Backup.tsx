import React, { useState, useCallback } from 'react'
import classNames from 'classnames'
import { Box, createStyles, Theme, makeStyles, InputBase, ThemeProvider } from '@material-ui/core'
import { Database as DatabaseIcon } from 'react-feather'
import { v4 as uuid } from 'uuid'
import { WrappedDialogProps, DashboardDialogCore, DashboardDialogWrapper, useSnackbarCallback } from './Base'
import { useI18N } from '../../../utils/i18n-next-ui'
import { DatabaseRecordType, DatabasePreviewCard } from '../DashboardComponents/DatabasePreviewCard'
import ActionButton, { DebounceButton } from '../DashboardComponents/ActionButton'
import Services from '../../service'
import { useAsync } from 'react-use'
import AbstractTab, { AbstractTabProps } from '../DashboardComponents/AbstractTab'
import { RestoreFromBackupBox } from '../DashboardComponents/RestoreFromBackupBox'
import { useSnackbar } from 'notistack'
import { merge, cloneDeep } from 'lodash-es'
import { decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import { UpgradeBackupJSONFile, BackupJSONFileLatest } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { extraPermissions } from '../../../utils/permissions'
import { green } from '@material-ui/core/colors'

const useDatabaseStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
        },
        dashboardPreviewCardTable: {
            paddingLeft: 28,
            paddingRight: 28,
            marginTop: 2,
            marginBottom: 28,
        },
    }),
)

//#region dashboard backup dialog
export function DashboardBackupDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const classes = useDatabaseStyles()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const { value, loading } = useAsync(() => Services.Welcome.generateBackupJSON())
    const records = [
        { type: DatabaseRecordType.Persona, length: value?.personas.length ?? 0, checked: false },
        { type: DatabaseRecordType.Profile, length: value?.profiles.length ?? 0, checked: false },
        { type: DatabaseRecordType.Post, length: value?.posts.length ?? 0, checked: false },
        { type: DatabaseRecordType.Group, length: value?.userGroups.length ?? 0, checked: false },
    ]

    const onConfirm = async () => {
        try {
            await Services.Welcome.createBackupFile({ download: true, onlyBackupWhoAmI: false })
            props.onClose()
        } catch (e) {
            enqueueSnackbar(t('set_up_backup_fail'), {
                variant: 'error',
            })
        }
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="medium"
                icon={<DatabaseIcon />}
                iconColor="#699CF7"
                primary={t('backup_database')}
                secondary={t('dashboard_backup_database_hint')}
                footer={
                    <Box className={classes.root} display="flex" flexDirection="column" alignItems="center">
                        <DatabasePreviewCard
                            classes={{ table: classes.dashboardPreviewCardTable }}
                            dense
                            records={records}></DatabasePreviewCard>
                        <DebounceButton
                            disabled={loading || records.every((r) => !r.length)}
                            variant="contained"
                            color="primary"
                            onClick={onConfirm}>
                            {t('dashboard_backup_database_confirmation')}
                        </DebounceButton>
                    </Box>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
//#endregion

//#region select backup
const useSelectBackupStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            marginTop: theme.spacing(-3),
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
        button: {
            marginTop: theme.spacing(3),
        },
    }),
)

interface SelectBackupProps {
    onConfirm?: (uuid: string, data: BackupJSONFileLatest) => void
}

function SelectBackup({ onConfirm }: SelectBackupProps) {
    const { t } = useI18N()
    const classes = useDatabaseStyles()
    const selectBackupClasses = useSelectBackupStyles()
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
                        className={selectBackupClasses.input}
                        placeholder={t('dashboard_paste_database_backup_hint')}
                        inputRef={(input: HTMLInputElement) => input && input.focus()}
                        multiline
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        inputProps={{
                            'data-testid': 'upload_textarea',
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
                const restoreId = uuid()
                await Services.Welcome.setUnconfirmedBackup(restoreId, json)
                onConfirm?.(restoreId, json)
            } catch (e) {
                enqueueSnackbar(t('set_up_restore_fail'), { variant: 'error' })
            }
        },
        [enqueueSnackbar, onConfirm, t],
    )

    return (
        <DashboardDialogWrapper
            size="medium"
            icon={<DatabaseIcon />}
            iconColor="#699CF7"
            primary={t('set_up_restore')}
            secondary={t('set_up_restore_hint')}
            footer={
                <Box
                    className={classNames(classes.root, selectBackupClasses.root)}
                    display="flex"
                    flexDirection="column"
                    alignItems="center">
                    <Box display="flex" flexDirection="column" style={{ width: '100%' }}>
                        <AbstractTab {...tabProps}></AbstractTab>
                    </Box>
                    <ActionButton
                        className={selectBackupClasses.button}
                        variant="contained"
                        color="primary"
                        disabled={!(state[0] === 0 && backupValue) && !(state[0] === 1 && textValue)}
                        onClick={() => restoreDB(state[0] === 0 ? backupValue : textValue)}
                        data-testid="restore_button">
                        {t('set_up_button_restore')}
                    </ActionButton>
                </Box>
            }
        />
    )
}
//#endregion

//#region confirm backup
const useConfirmBackupStyles = makeStyles((theme: Theme) =>
    createStyles<string, { imported: boolean }>({
        dashboardPreviewCardTable: {
            // keep dialogs vertical align when switching between them
            marginTop: (props) => (props.imported ? 2 : 26),
        },
        doneButton: {
            color: '#fff',
            backgroundColor: green[500],
            '&:hover': {
                backgroundColor: green[700],
            },
        },
    }),
)
interface ConfirmBackupProps {
    backup: BackupJSONFileLatest | null
    date: number
    restoreId: string
    onDone?: () => void
}

function ConfirmBackup({ restoreId, date, backup, onDone }: ConfirmBackupProps) {
    const [imported, setImported] = useState<boolean | 'loading'>(false)

    const { t } = useI18N()
    const classes = useDatabaseStyles()
    const confirmBackupClasses = useConfirmBackupStyles({
        imported: imported === true,
    })
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const time = new Date(date ? Number(date) : 0)
    const records = [
        { type: DatabaseRecordType.Persona, length: backup?.personas.length ?? 0, checked: imported === true },
        { type: DatabaseRecordType.Profile, length: backup?.profiles.length ?? 0, checked: imported === true },
        { type: DatabaseRecordType.Post, length: backup?.posts.length ?? 0, checked: imported === true },
        { type: DatabaseRecordType.Group, length: backup?.userGroups.length ?? 0, checked: imported === true },
    ]

    const onConfirm = async () => {
        const failToRestore = () => enqueueSnackbar(t('set_up_restore_fail'), { variant: 'error' })
        if (restoreId) {
            try {
                setImported('loading')
                await Services.Welcome.confirmBackup(restoreId)
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
        <DashboardDialogWrapper
            size="medium"
            icon={<DatabaseIcon />}
            iconColor="#699CF7"
            primary={t('restore_database')}
            secondary={
                imported === true
                    ? time.getTime() === 0
                        ? t('unknown_time')
                        : t('dashboard_restoration_successful_hint', {
                              time: time.toLocaleString(),
                          })
                    : t('set_up_restore_confirmation_hint')
            }
            footer={
                <Box className={classes.root} display="flex" flexDirection="column" alignItems="center">
                    <DatabasePreviewCard
                        classes={{
                            table: classNames(
                                classes.dashboardPreviewCardTable,
                                confirmBackupClasses.dashboardPreviewCardTable,
                            ),
                        }}
                        records={records}></DatabasePreviewCard>
                    {imported === true ? (
                        <ActionButton
                            className={confirmBackupClasses.doneButton}
                            variant="contained"
                            color="primary"
                            onClick={onDone}>
                            {t('set_up_button_done')}
                        </ActionButton>
                    ) : (
                        <ActionButton
                            variant="contained"
                            color="primary"
                            disabled={imported === 'loading'}
                            onClick={onConfirm}>
                            {t('set_up_button_confirm')}
                        </ActionButton>
                    )}
                </Box>
            }
        />
    )
}
//#endregion

//#region dashboard restore dialog
const backupTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {
            MuiButton: {
                root: {
                    '&[hidden]': {
                        visibility: 'hidden',
                    },
                },
            },
        },
    })

enum RestoreStep {
    SelectBackup = 'select-backup',
    ConfirmBackup = 'confirm-backup',
}

export function DashboardRestoreDialog(props: WrappedDialogProps) {
    const [step, setStep] = useState(RestoreStep.SelectBackup)
    const [backup, setBackup] = useState<BackupJSONFileLatest | null>(null)
    const [restoreId, setRestoreId] = useState('')

    function getCurrentStep(step: RestoreStep) {
        switch (step) {
            case RestoreStep.SelectBackup:
                return (
                    <SelectBackup
                        onConfirm={(restoreId: string, backup: BackupJSONFileLatest) => {
                            setBackup(backup)
                            setRestoreId(restoreId)
                            setStep(RestoreStep.ConfirmBackup)
                        }}
                    />
                )
            case RestoreStep.ConfirmBackup:
                return (
                    <ConfirmBackup
                        backup={backup}
                        restoreId={restoreId}
                        date={backup?._meta_.createdAt ?? 0}
                        onDone={props.onClose}
                    />
                )
            default:
                return null
        }
    }

    return (
        <ThemeProvider theme={backupTheme}>
            <DashboardDialogCore {...props}>{getCurrentStep(step)}</DashboardDialogCore>
        </ThemeProvider>
    )
}
//#endregion
