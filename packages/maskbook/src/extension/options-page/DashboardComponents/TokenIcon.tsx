import React from 'react'
import { makeStyles, createStyles, Avatar, Theme, AvatarProps } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { isSameAddress, getConstant } from '../../../web3/helpers'
import { CONSTANTS } from '../../../web3/constants'
import { useBlockie } from '../../../web3/hooks/useBlockie'
import { formatChecksumAddress } from '../../../plugins/Wallet/formatter'

const TRUST_WALLET_ASSETS = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum'

// Using the result of `formatChecksumAddress(TokenAddress)` directly to reduce calculation
const ETH_ADDRESS = getConstant(CONSTANTS, 'ETH_ADDRESS')
const CRUST_ADDRESS = '0x32a7C02e79c4ea1008dD6564b35F131428673c41'

const ICON_MAP = {
    [CRUST_ADDRESS]: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6747.png',
    [ETH_ADDRESS]: `${TRUST_WALLET_ASSETS}/info/logo.png`,
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        icon: {
            width: 16,
            height: 16,
            backgroundColor: theme.palette.common.white,
            margin: 0,
        },
    }),
)

export interface TokenIconProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    name?: string
    address: string
    AvatarProps?: Partial<AvatarProps>
}

export function TokenIcon(props: TokenIconProps) {
    const { address, name } = props
    const classes = useStylesExtends(useStyles(), props)
    const checksummedAddress = formatChecksumAddress(address)
    const tokenBlockie = useBlockie(props.address)

    return (
        <Avatar
            className={classes.icon}
            src={ICON_MAP[checksummedAddress] ?? `${TRUST_WALLET_ASSETS}/assets/${checksummedAddress}/logo.png`}
            {...props.AvatarProps}>
            <Avatar
                className={classes.icon}
                src={isSameAddress(checksummedAddress, ETH_ADDRESS) ? '/ethereum-logo.png' : tokenBlockie}>
                {name?.substr(0, 1).toLocaleUpperCase()}
            </Avatar>
        </Avatar>
    )
}
