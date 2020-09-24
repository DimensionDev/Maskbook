import React from 'react'
import { Chip, ChipProps, makeStyles, Theme, createStyles } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import { useWallets } from '../../plugins/Wallet/hooks/useWallet'
import { isSameAddress } from '../../web3/helpers'
import { ProviderIcon } from './ProviderIcon'
import { formatEthereumAddress } from '../../plugins/Wallet/formatter'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            lineHeight: 1,
        },
        icon: {
            fontSize: 18,
            width: 18,
            height: 18,
            marginLeft: theme.spacing(1),
        },
    })
})

export interface EthereumAccountChipProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    address?: string
    ChipProps?: Partial<ChipProps>
}

export function EthereumAccountChip(props: EthereumAccountChipProps) {
    const { address = '', ChipProps } = props
    const classes = useStylesExtends(useStyles(), props)

    const wallets = useWallets()
    const currentWallet = wallets.find((x) => isSameAddress(x.address, address))
    const avatar = <ProviderIcon classes={{ icon: classes.icon }} size={18} providerType={currentWallet?.provider} />
    const address_ = address.replace(/^0x/i, '')
    if (!address_) return null
    return avatar ? (
        <Chip
            avatar={avatar}
            className={classes.root}
            size="small"
            label={formatEthereumAddress(address_, 4)}
            {...ChipProps}
        />
    ) : (
        <Chip className={classes.root} size="small" label={formatEthereumAddress(address_, 4)} {...ChipProps} />
    )
}
