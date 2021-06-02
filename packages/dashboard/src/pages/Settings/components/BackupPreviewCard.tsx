import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { makeStyles } from '@material-ui/styles'
import classNames from 'classnames'

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

interface Props {
    json: {
        personas: { linkedProfiles: [] }[]
        posts: {}[]
        profiles: {}[]
        wallets: {}[]
    }
}

export default function BackupPreviewCard(props: any) {
    const classes = useStyles()
    const value = props.json

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
            value: value?.personas.reduce((a: number, b: { linkedProfiles: [] }) => a + b?.linkedProfiles.length, 0),
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

    return (
        <div className={classes.root}>
            {records.map((record, idx) => (
                <div className={classNames(classes.item, record.sub ? classes.sub : '')} key={idx}>
                    <span>{record.name}</span>
                    <span>{record.value}</span>
                </div>
            ))}
        </div>
    )
}
