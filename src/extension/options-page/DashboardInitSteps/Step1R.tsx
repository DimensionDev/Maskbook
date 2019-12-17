import React, { useState } from 'react'
import StepBase from './StepBase'
import { Typography, styled, Theme, makeStyles, createStyles, InputBase } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'
import { useDragAndDrop } from '../../../utils/hooks/useDragAndDrop'
import { Link, useHistory } from 'react-router-dom'
import BackupRestoreTab, { BackupRestoreTabProps } from '../DashboardComponents/BackupRestoreTab'
import ActionButton from '../DashboardComponents/ActionButton'
import { decompressBackupFile } from '../../../utils/type-transform/BackupFileShortRepresentation'
import Services from '../../service'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import { DatabaseRestoreSuccessDialog, DatabaseRestoreFailedDialog } from '../DashboardDialogs/Database'
import { BackupJSONFileLatest, UpgradeBackupJSONFile } from '../../../utils/type-transform/BackupFormat/JSON/latest'
import { extraPermissions } from '../../../utils/permissions'

const header = geti18nString('restore_database')

const useStyles = makeStyles(theme =>
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
    }),
)

const actions = (
    <>
        <ActionButton<typeof Link> variant="outlined" color="default" component={Link} to="start">
            {geti18nString('back')}
        </ActionButton>
        <ActionButton<typeof Link> variant="outlined" color="primary" component={Link} to="1ra">
            {geti18nString('advanced')}
        </ActionButton>
    </>
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
    const ref = React.useRef<HTMLInputElement>(null)
    const classes = useStyles()
    const [json, setJson] = React.useState<BackupJSONFileLatest | null>(null)
    const [textValue, setTextValue] = React.useState('')
    const [restoreState, setRestoreState] = React.useState<'success' | Error | null>(null)
    const [requiredPermissions, setRequiredPermssions] = React.useState<string[] | null>(null)
    const history = useHistory()
    const { dragEvents, fileReceiver, fileRef, dragStatus } = useDragAndDrop(file => {
        const fr = new FileReader()
        fr.readAsText(file)
        fr.addEventListener('loadend', async () => {
            const str = fr.result as string
            try {
                const json = UpgradeBackupJSONFile(decompressBackupFile(str))
                if (!json) throw new Error('UpgradeBackupJSONFile failed')
                setJson(json)
                const permissions = await extraPermissions(json.grantedHostPermissions)
                if (!permissions)
                    return await Services.Welcome.restoreBackup(json).then(() =>
                        history.push(
                            `2r?personas=${json.personas?.length}&profiles=${json.profiles?.length}&posts=${json.posts?.length}&contacts=${json.userGroups?.length}&date=${json._meta_?.createdAt}`,
                        ),
                    )
                setRequiredPermssions(permissions)
                setRestoreState('success')
            } catch (e) {
                console.error(e)
                setRestoreState(e)
            }
        })
    })

    const state = useState(0)
    const tabProps: BackupRestoreTabProps = {
        tabs: [
            {
                label: 'File',
                component: <FileUI></FileUI>,
                p: 0,
            },
            {
                // FIXME:
                label: 'TEXT',
                component: (
                    <InputBase
                        style={{ width: '100%', height: '100%', display: 'flex', overflow: 'auto' }}
                        multiline
                        value={textValue}
                        onChange={e => setTextValue(e.target.value)}></InputBase>
                ),
            },
        ],
        state,
    }

    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <BackupRestoreTab height={200} {...tabProps}></BackupRestoreTab>
        </div>
    )

    function FileUI() {
        return (
            <>
                <input
                    className={classes.file}
                    type="file"
                    accept="application/json"
                    ref={ref}
                    onChange={fileReceiver}
                />
                <RestoreBox
                    className={classes.restoreBox}
                    data-active={dragStatus === 'drag-enter'}
                    onClick={() => ref.current && ref.current.click()}>
                    {dragStatus === 'drag-enter' ? (
                        geti18nString('welcome_1b_dragging')
                    ) : fileRef.current ? (
                        geti18nString('welcome_1b_file_selected', fileRef.current.name)
                    ) : (
                        <>
                            <ActionButton variant="contained" color="primary" className={classes.restoreBoxButton}>
                                {geti18nString('select_file')}
                            </ActionButton>
                            <Typography variant="body2">{geti18nString('select_file_hint')}</Typography>
                        </>
                    )}
                </RestoreBox>

                {restoreState === 'success' && (
                    <DialogRouter
                        onExit={() => false}
                        children={
                            <DatabaseRestoreSuccessDialog
                                permissions={!!requiredPermissions}
                                onDecline={() => setRestoreState(null)}
                                onConfirm={() => {
                                    browser.permissions
                                        .request({ origins: requiredPermissions ?? [] })
                                        .then(granted =>
                                            granted ? Services.Welcome.restoreBackup(json!) : Promise.reject(),
                                        )
                                        .then(() =>
                                            history.push(
                                                `2r?personas=${json?.personas?.length}&profiles=${json?.profiles?.length}&posts=${json?.posts?.length}&contacts=${json?.userGroups?.length}&date=${json?._meta_?.createdAt}`,
                                            ),
                                        )
                                        .catch(setRestoreState)
                                }}
                            />
                        }
                    />
                )}
                {restoreState && restoreState !== 'success' && (
                    <DialogRouter
                        children={
                            <DatabaseRestoreFailedDialog onConfirm={() => setRestoreState(null)} error={restoreState} />
                        }
                    />
                )}
            </>
        )
    }

    return (
        <StepBase header={header} actions={actions}>
            {content}
        </StepBase>
    )
}
