import React, { useState } from 'react'
import { Box, createStyles, Theme, makeStyles, InputBase, styled, Button, ThemeProvider } from '@material-ui/core'
import { Database as DatabaseIcon } from 'react-feather'
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

const backupTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {
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
        },
    })

const useDatabaseStyles = makeStyles((theme: Theme) =>
    createStyles({
        dashboardPreviewCardTable: {
            paddingLeft: 28,
            paddingRight: 28,
            marginBottom: 28,
        },
    }),
)

//#region dashboard backup dialog
export function DashboardBackupDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const classes = useDatabaseStyles()

    const { value, loading } = useAsync(() => Services.Welcome.generateBackupJSON())
    const records = [
        { type: DatabaseRecordType.Persona, length: value?.personas.length ?? 0, checked: false },
        { type: DatabaseRecordType.Profile, length: value?.profiles.length ?? 0, checked: false },
        { type: DatabaseRecordType.Post, length: value?.posts.length ?? 0, checked: false },
        { type: DatabaseRecordType.Contact, length: value?.userGroups.length ?? 0, checked: false },
    ]

    const onConfirm = useSnackbarCallback(
        () => Services.Welcome.createBackupFile({ download: true, onlyBackupWhoAmI: false }),
        [],
        props.onClose,
    )

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="medium"
                icon={<DatabaseIcon />}
                iconColor="#699CF7"
                primary={t('backup_database')}
                secondary={t('dashboard_backup_database_hint')}
                footer={
                    <Box display="flex" flexDirection="column" alignItems="center" style={{ width: '100%' }}>
                        <DatabasePreviewCard
                            classes={{ table: classes.dashboardPreviewCardTable }}
                            dense
                            records={records}></DatabasePreviewCard>
                        <DebounceButton disabled={loading} variant="contained" color="primary" onClick={onConfirm}>
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
        input: {
            width: '100%',
            boxSizing: 'border-box',
            border: `solid 1px ${theme.palette.divider}`,
            borderRadius: 4,
            height: 176,
            padding: theme.spacing(2, 3),
            '& > textarea': {
                height: '100% !important',
            },
        },
    }),
)

interface SelectBackupProps {
    onConfirm?: () => void
}

function SelectBackup({ onConfirm }: SelectBackupProps) {
    const { t } = useI18N()
    const classes = useSelectBackupStyles()

    const [textValue, setTextValue] = useState('')

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('restore_database_file'),
                children: <RestoreFromBackupBox onChange={setTextValue} />,
                p: 0,
            },
            {
                label: t('restore_database_text'),
                children: (
                    <InputBase
                        className={classes.input}
                        placeholder={t('dashboard_paste_database_backup_hint')}
                        inputRef={(input: HTMLInputElement) => input && input.focus()}
                        multiline
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                    />
                ),
                p: 0,
            },
        ],
        state,
        height: 176,
    }

    return (
        <>
            <Box display="flex" flexDirection="column" style={{ width: '100%' }}>
                <AbstractTab {...tabProps}></AbstractTab>
            </Box>
            <ActionButton variant="contained" color="primary" onClick={onConfirm}>
                {t('confirm')}
            </ActionButton>
        </>
    )
}
//#endregion

//#region confirm backup
interface ConfirmBackupProps {
    personas?: number
    profiles?: number
    posts?: number
    contacts?: number
    date: string
    uuid: string
}

function ConfirmBackup({ personas, profiles, posts, contacts, date, uuid }: ConfirmBackupProps) {
    const { t } = useI18N()
    const classes = useDatabaseStyles()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const [imported, setImported] = useState<boolean | 'loading'>(false)

    const time = new Date(date ? Number(date) : 0)
    const records = [
        { type: DatabaseRecordType.Persona, length: personas ?? 0, checked: imported === true },
        { type: DatabaseRecordType.Profile, length: profiles ?? 0, checked: imported === true },
        { type: DatabaseRecordType.Post, length: posts ?? 0, checked: imported === true },
        { type: DatabaseRecordType.Contact, length: contacts ?? 0, checked: imported === true },
    ]

    const onConfirm = async () => {
        const failToRestore = () => enqueueSnackbar(t('set_up_restore_fail'), { variant: 'error' })
        if (uuid) {
            try {
                setImported('loading')
                await Services.Welcome.restoreBackupConfirmation(uuid)
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
        <>
            <DatabasePreviewCard
                classes={{ table: classes.dashboardPreviewCardTable }}
                records={records}></DatabasePreviewCard>
            <ActionButton variant="contained" color="primary" disabled={imported === 'loading'} onClick={onConfirm}>
                {t('dashboard_backup_database_confirmation')}
            </ActionButton>
        </>
    )
}
//#endregion

//#region dashboard restore dialog
enum RestoreStep {
    SelectBackup = 'select-backup',
    ConfirmBackup = 'confirm-backup',
}

export function DashboardRestoreDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const classes = useDatabaseStyles()
    const [step, setStep] = useState(RestoreStep.SelectBackup)

    function getCurrentStep(step: RestoreStep) {
        switch (step) {
            case RestoreStep.SelectBackup:
                return <SelectBackup />
            case RestoreStep.ConfirmBackup:
                return (
                    <ConfirmBackup
                        personas={0}
                        posts={0}
                        profiles={0}
                        contacts={0}
                        uuid={'xxx'}
                        date={new Date().toString()}
                    />
                )
        }
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                size="medium"
                icon={<DatabaseIcon />}
                iconColor="#699CF7"
                primary={t('restore_database')}
                secondary={t('dashboard_backup_database_hint')}
                footer={
                    <Box display="flex" flexDirection="column" alignItems="center" style={{ width: '100%' }}>
                        <ThemeProvider theme={backupTheme}>{getCurrentStep(step)}</ThemeProvider>
                    </Box>
                }></DashboardDialogWrapper>
        </DashboardDialogCore>
    )
}
//#endregion
