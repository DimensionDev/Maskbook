import { Avatar, ListItem, ListItemText, makeStyles, Theme, ListTypeMap, ListItemAvatar } from '@material-ui/core'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import { Wallet, useBlockie } from '@dimensiondev/web3-shared'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
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
    icon: {},
}))

export interface WalletInListProps extends withClasses<never> {
    wallet: Wallet
    disabled?: boolean
    onClick?: () => void
    ListItemProps?: Partial<DefaultComponentProps<ListTypeMap<{ button: true }, 'div'>>>
}

export function WalletInList(props: WalletInListProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyle(), props)
    const { wallet, disabled, onClick, ListItemProps } = props
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
                secondary={formatEthereumAddress(wallet.address)}
                secondaryTypographyProps={{
                    component: 'div',
                }}
            />
        </ListItem>
    )
}
