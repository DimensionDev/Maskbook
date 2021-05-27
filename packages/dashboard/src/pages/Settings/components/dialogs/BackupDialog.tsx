import ConfirmDialog from '../../../../components/ConfirmDialog'
import React, { ChangeEvent, useState } from 'react'
import { Card, Checkbox, FormControlLabel } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import classNames from 'classnames'
import { Services } from '../../../../API'
import { useAsync } from 'react-use'

const useStyles = makeStyles((theme) => ({
    root: {
        flex: 1,
    },
    card: {
        width: '100%',
        minHeight: 205,
        borderRadius: 8,
        background: MaskColorVar.infoBackground,
        boxShadow: 'none',
    },
}))

const useDetailStyles = makeStyles(() => ({
    root: {
        padding: '19px 24px 9px',
    },
    item: {
        paddingBottom: 10,
        display: 'flex',
        justifyContent: 'space-between',
    },
    sub: {
        paddingLeft: 60,
    },
}))

interface BackupDetailProps {
    records: {
        name: string
        value: any
        sub?: boolean
    }[]
}

const BackupDetail = (props: BackupDetailProps) => {
    const classes = useDetailStyles()
    return (
        <div className={classes.root}>
            {props.records.map((record) => (
                <div className={classNames(classes.item, record.sub ? classes.sub : '')}>
                    <span>{record.name}</span>
                    <span>{record.value}</span>
                </div>
            ))}
        </div>
    )
}

interface BackupDialogProps {
    open: boolean
    onClose(): void
}

export default function BackupDialog({ open, onClose }: BackupDialogProps) {
    const [checked, setChecked] = useState(true)

    const { value, loading } = useAsync(() => Services.Welcome.generateBackupJSON())
    const records = [
        {
            name: 'Account',
            // TODO: get email
            value: 'xxx@mask.io',
        },
        {
            name: 'Personas',
            value: value?.personas.length ?? 0,
        },
        {
            name: 'Associated account',
            value: value?.personas.reduce((a, b) => a + b.linkedProfiles.length, 0),
            sub: true,
        },
        {
            name: 'Encrypted Post',
            value: value?.posts.length ?? 0,
            sub: true,
        },
        {
            name: 'Contacts',
            value: value?.profiles.length ?? 0,
            sub: true,
        },
        {
            name: 'File',
            // TODO: file
            value: 0,
            sub: true,
        },
        {
            name: 'Local Wallet',
            value: value?.wallets.length ?? 0,
        },
    ]

    const classes = useStyles()

    const handleClose = () => {
        onClose()
    }
    const handleConfirm = async () => {
        try {
            await Services.Welcome.createBackupFile({ download: true, onlyBackupWhoAmI: false })
            onClose()
        } catch (e) {
            // TODO: show snack bar
            // enqueueSnackbar(t('set_up_backup_fail'), {
            //     variant: 'error',
            // })
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked)
    }

    return (
        <ConfirmDialog
            title="Global Backup"
            confirmText="Backup"
            open={open}
            confirmDisabled={loading}
            onClose={handleClose}
            onConfirm={handleConfirm}>
            <div className={classes.root}>
                <Card className={classes.card}>
                    <BackupDetail records={records} />
                </Card>
                <FormControlLabel
                    control={<Checkbox checked={checked} onChange={handleChange} />}
                    label="Encrypt with account password"
                />
            </div>
        </ConfirmDialog>
    )
}
