import { makeStyles, createStyles, Avatar, Theme, AvatarProps } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { isSameAddress, getConstant } from '../../../web3/helpers'
import { CONSTANTS } from '../../../web3/constants'
import { useBlockie } from '../../../web3/hooks/useBlockie'
import { formatChecksumAddress } from '../../../plugins/Wallet/formatter'

//#region fix icon image
const TRUST_WALLET_ASSETS = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum'
const ETH_ADDRESS = getConstant(CONSTANTS, 'ETH_ADDRESS')
const ICON_MAP = {
    [ETH_ADDRESS]: `${TRUST_WALLET_ASSETS}/info/logo.png`,
    '0x32a7C02e79c4ea1008dD6564b35F131428673c41': 'https://s2.coinmarketcap.com/static/img/coins/64x64/6747.png', // CRUST
    '0x04abEdA201850aC0124161F037Efd70c74ddC74C': 'https://s2.coinmarketcap.com/static/img/coins/64x64/5841.png', // NEST
    '0x14de81C71B3F73874659082b971433514E201B27': 'https://etherscan.io/token/images/ykyctoken_32.png', // Yes KYC
}

function resolveTokenIconURL(address: string) {
    const checksummedAddress = formatChecksumAddress(address)
    if (isSameAddress(checksummedAddress, getConstant(CONSTANTS, 'ETH_ADDRESS')))
        return 'https://rawcdn.githack.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
    if (ICON_MAP[checksummedAddress]) return ICON_MAP[checksummedAddress]
    return `${TRUST_WALLET_ASSETS}/assets/${checksummedAddress}/logo.png`
}
//#endregion

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
    currentIcon?: JSX.Element
}

export function TokenIcon(props: TokenIconProps) {
    const { address, name, currentIcon } = props
    const classes = useStylesExtends(useStyles(), props)
    const tokenBlockie = useBlockie(props.address)

    return (
        <Avatar className={classes.icon} src={resolveTokenIconURL(address)} {...props.AvatarProps}>
            {currentIcon ? (
                (() => currentIcon)()
            ) : (
                <Avatar className={classes.icon} src={tokenBlockie}>
                    {name?.substr(0, 1).toLocaleUpperCase()}
                </Avatar>
            )}
        </Avatar>
    )
}
