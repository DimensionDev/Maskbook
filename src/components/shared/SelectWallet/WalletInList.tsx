import React from 'react'
import { ListItem, ListItemText, makeStyles, Theme, ListTypeMap, ListItemAvatar } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../custom-ui-helper'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { MaskbookIcon } from '../../../resources/MaskbookIcon'
import { MetaMaskIcon } from '../../../resources/MetaMaskIcon'
import { WalletConnectIcon } from '../../../resources/WalletConnectIcon'
import { ProviderType } from '../../../web3/types'

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
        fontSize: 40,
    },
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

    let avatar = null
    switch (wallet.provider) {
        case ProviderType.Maskbook:
            avatar = <MaskbookIcon className={classes.icon} viewBox="0 0 40 40" />
            break
        case ProviderType.MetaMask:
            avatar = <MetaMaskIcon className={classes.icon} viewBox="0 0 40 40" />
            break
        case ProviderType.WalletConnect:
            avatar = <WalletConnectIcon className={classes.icon} viewBox="0 0 40 40" />
            break
        default:
            avatar = null
            break
    }

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
                secondary={wallet.address}
                secondaryTypographyProps={{
                    component: 'div',
                }}
            />
        </ListItem>
    )
}
