import { Box, InputBase, makeStyles, Theme } from '@material-ui/core'
import classNames from 'classnames'
import { useSnackbar } from '@masknet/theme'
import { useState } from 'react'
import { Database as DatabaseIcon } from 'react-feather'
import { useAsync } from 'react-use'
import { v4 as uuid } from 'uuid'
import {
    useI18N,
    extraPermissions,
    decompressBackupFile,
    BackupJSONFileLatest,
    UpgradeBackupJSONFile,
} from '../../../../utils'
import Services from '../../../service'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import ActionButton from '../../DashboardComponents/ActionButton'
import { RestoreFromBackupBox } from '../../DashboardComponents/RestoreFromBackupBox'
import { DashboardDialogWrapper } from '../Base'
import { useDatabaseStyles } from './style'

const useSelectBackupStyles = makeStyles((theme: Theme) => ({
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
}))

interface SelectBackupProps {
    onConfirm?: (uuid: string, data: BackupJSONFileLatest) => void
}

export function SelectBackup({ onConfirm }: SelectBackupProps) {
    const { t } = useI18N()
    const classes = useDatabaseStyles()
    const selectBackupClasses = useSelectBackupStyles()
    const { enqueueSnackbar } = useSnackbar()

    const [file, setFile] = useState<File | null>(null)
    const [json, setJSON] = useState<BackupJSONFileLatest | null>(null)
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
                sx: { p: 0 },
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
                sx: { p: 0 },
            },
        ],
        state,
        height: 176,
    }

    const permissionState = useAsync(async () => {
        const json = UpgradeBackupJSONFile(decompressBackupFile(state[0] === 0 ? backupValue : textValue))
        setJSON(json)
        if (!json) throw new Error('UpgradeBackupJSONFile failed')
        return extraPermissions(json.grantedHostPermissions)
    }, [state[0], backupValue, textValue])
    const restoreDB = async () => {
        try {
            if (!json) return
            const permissions = permissionState.value ?? []
            if (permissions.length) {
                const granted = await browser.permissions.request({ origins: permissions ?? [] })
                if (!granted) return
            }
            const restoreId = uuid()
            await Services.Welcome.setUnconfirmedBackup(restoreId, json)
            onConfirm?.(restoreId, json)
        } catch (e) {
            enqueueSnackbar(t('set_up_restore_fail'), { variant: 'error' })
        }
    }

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
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                    <Box
                        style={{ width: '100%' }}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                        <AbstractTab {...tabProps} />
                    </Box>
                    <ActionButton
                        className={selectBackupClasses.button}
                        variant="contained"
                        disabled={
                            (!(state[0] === 0 && backupValue) && !(state[0] === 1 && textValue)) ||
                            !json ||
                            permissionState.loading ||
                            !!permissionState.error
                        }
                        onClick={restoreDB}
                        data-testid="restore_button">
                        {t('set_up_button_restore')}
                    </ActionButton>
                </Box>
            }
        />
    )
}
