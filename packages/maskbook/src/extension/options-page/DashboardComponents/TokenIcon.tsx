import { makeStyles, createStyles, Avatar, Theme, AvatarProps } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { isSameAddress, getConstant } from '../../../web3/helpers'
import { CONSTANTS } from '../../../web3/constants'
import { useBlockie } from '../../../web3/hooks/useBlockie'
import { formatChecksumAddress } from '../../../plugins/Wallet/formatter'
import { useImageFailover } from '../../../utils/hooks/useImageFailover'

//#region fix icon image
const ETH_ADDRESS = getConstant(CONSTANTS, 'ETH_ADDRESS')

const iconSourceList = [
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum',
    'https://rawcdn.githack.com/trustwallet/assets/master/blockchains/ethereum',
]
const IMG_SUFFIX = '/info/logo.png'

function resolveTokenIconURL(address: string, trustWalletAssets: string) {
    const iconMap = {
        [ETH_ADDRESS]: `${trustWalletAssets}/info/logo.png`,
        '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074':
            'https://dimensiondev.github.io/Maskbook-VI/assets/Logo/MB--Logo--Geo--ForceCircle--Blue.svg', // MASK
        '0x32a7C02e79c4ea1008dD6564b35F131428673c41': 'https://s2.coinmarketcap.com/static/img/coins/64x64/6747.png', // CRUST
        '0x04abEdA201850aC0124161F037Efd70c74ddC74C': 'https://s2.coinmarketcap.com/static/img/coins/64x64/5841.png', // NEST
        '0x14de81C71B3F73874659082b971433514E201B27': 'https://etherscan.io/token/images/ykyctoken_32.png', // Yes KYC
    }
    const checksummedAddress = formatChecksumAddress(address)
    if (isSameAddress(checksummedAddress, getConstant(CONSTANTS, 'ETH_ADDRESS')))
        return 'https://rawcdn.githack.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
    if (iconMap[checksummedAddress]) return iconMap[checksummedAddress]
    return `${trustWalletAssets}/assets/${checksummedAddress}/logo.png`
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

export interface TokenIconProps extends withClasses<never> {
    name?: string
    address: string
    logoURL?: string
    AvatarProps?: Partial<AvatarProps>
}

export function TokenIcon(props: TokenIconProps) {
    const { address, logoURL, name } = props
    const classes = useStylesExtends(useStyles(), props)
    const tokenBlockie = useBlockie(props.address)

    const { value: trustWalletAssets, loading } = useImageFailover(iconSourceList, IMG_SUFFIX)

    if (logoURL)
        return (
            <Avatar className={classes.icon} src={logoURL} {...props.AvatarProps}>
                {name?.substr(0, 1).toLocaleUpperCase()}
            </Avatar>
        )
    return (
        <Avatar
            className={classes.icon}
            src={loading ? '' : resolveTokenIconURL(address, trustWalletAssets as string)}
            {...props.AvatarProps}>
            <Avatar className={classes.icon} src={tokenBlockie}>
                {name?.substr(0, 1).toLocaleUpperCase()}
            </Avatar>
        </Avatar>
    )
}
