import React from 'react'
import { EthereumAddress } from 'wallet.ts'
import { makeStyles, createStyles, Avatar, Theme } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { isSameAddress } from '../../../web3/helpers'
import { useConstant } from '../../../web3/hooks/useConstant'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        coin: {
            width: 16,
            height: 16,
        },
    }),
)

export interface TokenIconProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    name?: string
    address: string
}

export function TokenIcon(props: TokenIconProps) {
    const { address, name } = props
    const classes = useStylesExtends(useStyles(), props)
    const ETH_ADDRESS = useConstant('ETH_ADDRESS')
    const checksumAddress = EthereumAddress.checksumAddress(address)
    return (
        <Avatar
            className={classes.coin}
            src={
                isSameAddress(ETH_ADDRESS, checksumAddress)
                    ? 'https://rawcdn.githack.com/trustwallet/assets/257c82b25e6f27ede7a2b309aadc0ed17bca45ae/blockchains/ethereum/info/logo.png'
                    : `https://rawcdn.githack.com/trustwallet/assets/257c82b25e6f27ede7a2b309aadc0ed17bca45ae/blockchains/ethereum/assets/${checksumAddress}/logo.png`
            }>
            {name?.substr(0, 1).toLocaleUpperCase()}
        </Avatar>
    )
}
