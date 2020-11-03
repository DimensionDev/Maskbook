import React from 'react'
import { ListItem, ListItemText, makeStyles, Theme, ListTypeMap, ListItemAvatar } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../custom-ui-helper'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { ProviderIcon } from '../ProviderIcon'
import { formatEthereumAddress } from '../../../plugins/Wallet/formatter'

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

export interface WalletInListProps extends withClasses<KeysInferFromUseStyles<typeof useStyle>> {
    wallet: WalletRecord
    disabled?: boolean
    onClick?: () => void
    ListItemProps?: Partial<DefaultComponentProps<ListTypeMap<{ button: true }, 'div'>>>
}

export function WalletInList(props: WalletInListProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyle(), props)
    const { wallet, disabled, onClick, ListItemProps } = props

    const avatar = <ProviderIcon classes={{ icon: classes.icon }} size={40} providerType={wallet.provider} />

    return (
        <ListItem button disabled={disabled} onClick={onClick} {...ListItemProps}>
            {avatar ? <ListItemAvatar>{avatar}</ListItemAvatar> : null}
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
        </ListItem>
    )
}
