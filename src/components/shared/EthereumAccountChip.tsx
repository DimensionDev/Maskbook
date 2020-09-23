import React from 'react'
import { Chip, ChipProps, makeStyles, Theme, createStyles } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'
import { useWallets } from '../../plugins/Wallet/hooks/useWallet'
import { isSameAddress } from '../../web3/helpers'
import { ProviderType } from '../../web3/types'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { MetaMaskIcon } from '../../resources/MetaMaskIcon'
import { WalletConnectIcon } from '../../resources/WalletConnectIcon'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            lineHeight: 1,
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
    console.log(currentWallet)
    let avatar = null
    switch (currentWallet?.provider) {
        case ProviderType.Maskbook:
            avatar = <MaskbookIcon viewBox="0 0 40 40" />
            break
        case ProviderType.MetaMask:
            avatar = <MetaMaskIcon viewBox="0 0 40 40" />
            break
        case ProviderType.WalletConnect:
            avatar = <WalletConnectIcon viewBox="0 0 40 40" />
            break
        default:
            avatar = null
            break
    }
    const address_ = address.replace(/^0x/i, '')
    if (!address_) return null
    return avatar ? (
        <Chip
            avatar={avatar}
            className={classes.root}
            size="small"
            label={`0x${address_.slice(0, 4)}...${address_.slice(-4)}`}
            {...ChipProps}
        />
    ) : (
        <Chip
            className={classes.root}
            size="small"
            label={`0x${address_.slice(0, 4)}...${address_.slice(-4)}`}
            {...ChipProps}
        />
    )
}
