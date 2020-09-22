import React from 'react'
import { EthereumAddress } from 'wallet.ts'
import { makeStyles, createStyles, Avatar, Theme, AvatarProps } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { isSameAddress } from '../../../web3/helpers'
import { useConstant } from '../../../web3/hooks/useConstant'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        icon: {
            width: 16,
            height: 16,
            backgroundColor: theme.palette.common.white,
        },
    }),
)

export interface TokenIconProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    name?: string
    address: string
    AvatarProps?: Partial<AvatarProps>
}

export function TokenIcon(props: TokenIconProps) {
    const ETH_ADDRESS = useConstant('ETH_ADDRESS')

    const { address, name } = props
    const classes = useStylesExtends(useStyles(), props)

    const checksumAddress = EthereumAddress.checksumAddress(address)
    return (
        <Avatar
            className={classes.icon}
            src={
                isSameAddress(ETH_ADDRESS, checksumAddress)
                    ? 'https://rawcdn.githack.com/trustwallet/assets/257c82b25e6f27ede7a2b309aadc0ed17bca45ae/blockchains/ethereum/info/logo.png'
                    : `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checksumAddress}/logo.png`
            }
            {...props.AvatarProps}>
            {name?.substr(0, 1).toLocaleUpperCase()}
        </Avatar>
    )
}
