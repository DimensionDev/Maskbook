import React from 'react'
import { ListItem, ListItemText, makeStyles, Theme, ListTypeMap } from '@material-ui/core'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../custom-ui-helper'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import { Address } from '../../../extension/options-page/DashboardComponents/Address'

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        display: 'inline-grid',
    },
    overflow: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
}))

export interface WalletInListProps extends withClasses<KeysInferFromUseStyles<typeof useStyle>> {
    item: WalletRecord
    disabled?: boolean
    onClick?: () => void
    ListItemProps?: Partial<DefaultComponentProps<ListTypeMap<{ button: true }, 'div'>>>
}

export function WalletInList(props: WalletInListProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyle(), props)
    const { item, disabled, onClick, ListItemProps } = props

    return (
        <ListItem button disabled={disabled} onClick={onClick} {...ListItemProps}>
            <ListItemText
                classes={{
                    root: classes.root,
                    primary: classes.overflow,
                    secondary: classes.overflow,
                }}
                primary={item.name}
                secondary={<Address address={item.address} />}
            />
        </ListItem>
    )
}
