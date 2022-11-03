import { Avatar, ListItemAvatar, ListItemIcon, ListItemText, ListTypeMap } from '@mui/material'
import ListItemButton from '@mui/material/ListItemButton'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Check as CheckIcon } from '@mui/icons-material'
import type { DefaultComponentProps } from '@mui/material/OverridableComponent'
import { formatEthereumAddress, Wallet } from '@masknet/web3-shared-evm'
import { useBlockie } from '@masknet/web3-hooks-base'
import { useI18N } from '../../../utils/index.js'

const useStyle = makeStyles()((theme) => ({
    root: {
        display: 'inline-grid',
    },
    overflow: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    icon: {
        color: '#77E0B5',
        minWidth: 26,
        marginLeft: theme.spacing(1),
    },
}))

export interface WalletInListProps extends withClasses<never> {
    wallet: Wallet
    selected?: boolean
    disabled?: boolean
    onClick?: () => void
    ListItemProps?: Partial<
        DefaultComponentProps<
            ListTypeMap<
                {
                    button: true
                },
                'div'
            >
        >
    >
}

export function WalletInList(props: WalletInListProps) {
    const { t } = useI18N()
    const { classes } = useStylesExtends(useStyle(), props)
    const { wallet, selected = false, disabled = false, onClick, ListItemProps } = props
    const blockie = useBlockie(wallet.address)

    return (
        <ListItemButton disabled={disabled} onClick={onClick} {...ListItemProps}>
            <ListItemAvatar>
                <Avatar src={blockie} />
            </ListItemAvatar>
            <ListItemText
                classes={{
                    root: classes.root,
                    primary: classes.overflow,
                    secondary: classes.overflow,
                }}
                primary={wallet.name}
                secondary={formatEthereumAddress(wallet.address, 16)}
                secondaryTypographyProps={{
                    component: 'div',
                }}
            />
            {selected ? (
                <ListItemIcon className={classes.icon}>
                    <CheckIcon fontSize="small" />
                </ListItemIcon>
            ) : null}
        </ListItemButton>
    )
}
