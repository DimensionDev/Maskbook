import {
    Avatar,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    ListTypeMap,
    makeStyles,
    Theme,
} from '@material-ui/core'
import CheckIcon from '@material-ui/icons/Check'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import { formatEthereumAddress, useBlockie, Wallet } from '@masknet/web3-shared'
import { useI18N } from '../../../utils'
import { useStylesExtends } from '../../custom-ui-helper'

const useStyle = makeStyles((theme: Theme) => ({
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
    ListItemProps?: Partial<DefaultComponentProps<ListTypeMap<{ button: true }, 'div'>>>
}

export function WalletInList(props: WalletInListProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyle(), props)
    const { wallet, selected = false, disabled = false, onClick, ListItemProps } = props
    const blockie = useBlockie(wallet.address)

    return (
        <ListItem button disabled={disabled} onClick={onClick} {...ListItemProps}>
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
        </ListItem>
    )
}
