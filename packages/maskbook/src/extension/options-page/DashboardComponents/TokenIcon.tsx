import React from 'react'
import { makeStyles, createStyles, Avatar, Theme, AvatarProps } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { isSameAddress, getConstant } from '../../../web3/helpers'
import { CONSTANTS } from '../../../web3/constants'
import { useBlockie } from '../../../web3/hooks/useBlockie'
import { formatChecksumAddress } from '../../../plugins/Wallet/formatter'

const ICON_MAP = {
    [formatChecksumAddress(
        '0x32a7c02e79c4ea1008dd6564b35f131428673c41',
    )]: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6747.png',
}

function resolveTokenIconURL(address: string) {
    const checksummedAddress = formatChecksumAddress(address)
    if (isSameAddress(checksummedAddress, getConstant(CONSTANTS, 'ETH_ADDRESS')))
        return 'https://rawcdn.githack.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
    if (ICON_MAP[checksummedAddress]) return ICON_MAP[checksummedAddress]
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checksummedAddress}/logo.png`
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
    const tokenBlockie = useBlockie(props.address)

    return (
        <Avatar className={classes.icon} src={resolveTokenIconURL(address)} {...props.AvatarProps}>
            <Avatar className={classes.icon} src={tokenBlockie}>
                {name?.substr(0, 1).toLocaleUpperCase()}
            </Avatar>
        </Avatar>
    )
}
