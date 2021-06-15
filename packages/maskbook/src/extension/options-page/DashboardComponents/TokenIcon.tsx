import { makeStyles, Avatar, Theme, AvatarProps } from '@material-ui/core'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import {
    CONSTANTS,
    useBlockie,
    useChainDetailed,
    ChainId,
    useConstant,
    constantOfChain,
} from '@dimensiondev/web3-shared'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useImageFailover } from '../../../utils'

//#region fix icon image
function resolveTokenIconURL(address: string, baseURI: string, chainId: ChainId) {
    const iconMap = {
        [constantOfChain(CONSTANTS, chainId).NATIVE_TOKEN_ADDRESS]: `${baseURI}/info/logo.png`,
        '0x04abEdA201850aC0124161F037Efd70c74ddC74C': 'https://s2.coinmarketcap.com/static/img/coins/64x64/5841.png', // NEST
        '0x14de81C71B3F73874659082b971433514E201B27': 'https://etherscan.io/token/images/ykyctoken_32.png', // Yes KYC
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
    logoURL?: string
    chainId?: ChainId
    address: string
    AvatarProps?: Partial<AvatarProps>
}

export function TokenIcon(props: TokenIconProps) {
    const { address, logoURL, name, chainId, AvatarProps } = props

    const classes = useStylesExtends(useStyles(), props)
    const chainDetailed = useChainDetailed()
    const tokenBlockie = useBlockie(address)
    const tokenAssetBaseURI = useConstant(CONSTANTS, 'TOKEN_ASSET_BASE_URI')

    const { value: baseURI, loading } = useImageFailover(chainDetailed ? tokenAssetBaseURI : [], '/info/logo.png')

    if (logoURL)
        return (
            <Avatar className={classes.icon} src={logoURL} {...AvatarProps}>
                {name?.substr(0, 1).toLocaleUpperCase()}
            </Avatar>
        )
    return (
        <Avatar
            className={classes.icon}
            src={loading ? '' : resolveTokenIconURL(address, baseURI!, chainId ?? ChainId.Mainnet)}
            {...AvatarProps}>
            <Avatar className={classes.icon} src={tokenBlockie}>
                {name?.substr(0, 1).toLocaleUpperCase()}
            </Avatar>
        </Avatar>
    )
}
