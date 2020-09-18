import React, { useMemo } from 'react'
import { ListItem, ListItemText, makeStyles, Theme, ListTypeMap, ListItemAvatar } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../custom-ui-helper'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { MaskbookIcon } from '../../../resources/MaskbookIcon'
import { WalletProviderType } from '../../../plugins/shared/findOutProvider'
import { MetaMaskIcon } from '../../../resources/MetaMaskIcon'
import { WalletConnectIcon } from '../../../resources/WalletConnectIcon'

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

    const avatar = useMemo(() => {
        if (wallet.type === 'managed') return <MaskbookIcon className={classes.icon} viewBox="0 0 40 40" />
        if (wallet.provider === WalletProviderType.metamask)
            return <MetaMaskIcon className={classes.icon} viewBox="0 0 40 40" />
        if (wallet.provider === WalletProviderType.wallet_connect)
            return <WalletConnectIcon className={classes.icon} viewBox="0 0 40 40" />
        return null
    }, [])

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
