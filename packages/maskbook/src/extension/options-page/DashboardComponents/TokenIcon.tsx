import { makeStyles, Avatar, Theme, AvatarProps } from '@material-ui/core'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { getConstant } from '../../../web3/helpers'
import { CONSTANTS } from '../../../web3/constants'
import { useBlockie } from '../../../web3/hooks/useBlockie'
import { useChainDetailed } from '../../../web3/hooks/useChainDetailed'
import { useImageFailover } from '../../../utils/hooks/useImageFailover'

//#region fix icon image
function resolveTokenIconURL(address: string, baseURI: string) {
    const iconMap = {
        [getConstant(CONSTANTS, 'NATIVE_TOKEN_ADDRESS')]: `${baseURI}/info/logo.png`,
        '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074':
            'https://dimensiondev.github.io/Maskbook-VI/assets/Logo/MB--Logo--Geo--ForceCircle--Blue.svg', // MASK
        '0x32a7C02e79c4ea1008dD6564b35F131428673c41': 'https://s2.coinmarketcap.com/static/img/coins/64x64/6747.png', // CRUST
        '0x04abEdA201850aC0124161F037Efd70c74ddC74C': 'https://s2.coinmarketcap.com/static/img/coins/64x64/5841.png', // NEST
        '0x14de81C71B3F73874659082b971433514E201B27': 'https://etherscan.io/token/images/ykyctoken_32.png', // Yes KYC
        '0x3B73c1B2ea59835cbfcADade5462b6aB630D9890':
            'https://raw.githubusercontent.com/chainswap/chainswap-assets/main/logo_white_256.png', // TOKEN
    }
    const checksummedAddress = formatEthereumAddress(address)
    if (iconMap[checksummedAddress]) return iconMap[checksummedAddress]
    return `${baseURI}/assets/${checksummedAddress}/logo.png`
}
//#endregion

const useStyles = makeStyles((theme: Theme) => ({
    icon: {
        width: 16,
        height: 16,
        backgroundColor: theme.palette.common.white,
        margin: 0,
    },
}))

export interface TokenIconProps extends withClasses<never> {
    name?: string
    address: string
    logoURL?: string
    AvatarProps?: Partial<AvatarProps>
}

export function TokenIcon(props: TokenIconProps) {
    const { address, logoURL, name } = props
    const classes = useStylesExtends(useStyles(), props)

    const chainDetailed = useChainDetailed()
    const tokenBlockie = useBlockie(props.address)

    const { value: baseURI, loading } = useImageFailover(
        chainDetailed
            ? [
                  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainDetailed.fullName.toLowerCase()}`,
                  `https://rawcdn.githack.com/trustwallet/assets/master/blockchains/${chainDetailed.fullName.toLowerCase()}`,
              ]
            : [],
        '/info/logo.png',
    )

    if (logoURL)
        return (
            <Avatar className={classes.icon} src={logoURL} {...props.AvatarProps}>
                {name?.substr(0, 1).toLocaleUpperCase()}
            </Avatar>
        )
    return (
        <Avatar
            className={classes.icon}
            src={loading ? '' : resolveTokenIconURL(address, baseURI as string)}
            {...props.AvatarProps}>
            <Avatar className={classes.icon} src={tokenBlockie}>
                {name?.substr(0, 1).toLocaleUpperCase()}
            </Avatar>
        </Avatar>
    )
}
