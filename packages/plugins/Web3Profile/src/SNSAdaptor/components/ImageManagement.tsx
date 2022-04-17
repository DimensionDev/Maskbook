import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useI18N } from '../../locales'
// import { Copy } from 'react-feather'
import { WalletAssetsCard } from './WalletAssets'
import { BindingProof } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '520px !important',
    },
    paperRoot: {
        backgroundImage: 'none',
        '&>h2': {
            height: 30,
            border: `1px solid ${theme.palette.divider}`,
            padding: theme.spacing(1.875, 2.5, 1.875, 2.5),
            marginBottom: 24,
        },
    },
    content: {
        width: 480,
        height: 510,
        maxHeight: 510,
        posotion: 'relative',
        paddingBottom: theme.spacing(3),
    },
    bottomFixed: {
        width: '100%',
        display: 'flex',
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    link: {
        cursor: 'pointer',
        lineHeight: '10px',
        marginTop: 2,
        '&:hover': {
            textDecoration: 'none',
        },
    },
    linkIcon: {
        fill: 'none',
        width: 12,
        height: 12,
        marginLeft: theme.spacing(0.5),
    },
    actions: {
        padding: '0px !important',
    },
}))

export interface ImageManagementProps extends withClasses<never | 'root'> {
    addresses?: BindingProof[]
    onSetting: (addr: string) => void
}

export function ImageManagement(props: ImageManagementProps) {
    const t = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { addresses, onSetting } = props

    return (
        <div>
            {addresses?.map((address) => (
                <WalletAssetsCard
                    key={address.identity}
                    onSetting={() => onSetting(address.identity)}
                    address={address.identity}
                />
            ))}
        </div>
    )
}
