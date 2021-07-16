import { MaskColorVar } from '@masknet/theme'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import classNames from 'classnames'
import { useDashboardI18N } from '../../../locales'
export interface BackupPreview {
    email?: string
    personas: number
    accounts: number
    posts: number
    contacts: number
    files: number
    wallets: number
}

const useStyles = makeStyles(() => ({
    root: {
        padding: '19px 24px 9px',
        minHeight: 205,
        borderRadius: 8,
        background: MaskColorVar.infoBackground,
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

export interface Props {
    json: BackupPreview
}

export default function BackupPreviewCard({ json }: Props) {
    const t = useDashboardI18N()
    const classes = useStyles()

    const records = [
        {
            name: t.settings_backup_preview_account(),
            value: json.email,
        },
        {
            name: t.settings_backup_preview_personas(),
            value: json.personas,
        },
        {
            name: t.settings_backup_preview_associated_account(),
            value: json.accounts,
            sub: true,
        },
        {
            name: t.settings_backup_preview_posts(),
            value: json.posts,
            sub: true,
        },
        {
            name: t.settings_backup_preview_contacts(),
            value: json.contacts,
            sub: true,
        },
        {
            name: t.settings_backup_preview_fils(),
            value: json.files,
            sub: true,
        },
        {
            name: t.settings_backup_preview_wallets(),
            value: json.wallets,
        },
    ]

    return (
        <div className={classes.root}>
            {records.map((record, idx) => (
                <div className={classNames(classes.item, record.sub ? classes.sub : '')} key={idx}>
                    <Typography>{record.name}</Typography>
                    <Typography>{record.value}</Typography>
                </div>
            ))}
        </div>
    )
}
