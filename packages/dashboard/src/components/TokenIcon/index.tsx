import { makeStyles, Avatar, Theme, AvatarProps } from '@material-ui/core'
import { useStylesExtends } from '@masknet/shared'
import { formatEthereumAddress } from '@masknet/shared'
import {
    CONSTANTS,
    useBlockie,
    useChainDetailed,
    ChainId,
    constantOfChain,
    isSameAddress,
    useConstantNext,
    TOKEN_CONSTANTS,
    currySameAddress,
} from '@masknet/web3-shared'
import { useImageFailover } from '../TokenList/useImageFailover'
import SPECIAL_ICON_LIST from './TokenIconSpecialIconList.json'

//#region fix icon image
function resolveTokenIconURLs(address: string, baseURIs: string[], chainId: ChainId, logoURI?: string) {
    const checkSummedAddress = formatEthereumAddress(address)

    if (isSameAddress(constantOfChain(TOKEN_CONSTANTS, chainId).NATIVE_TOKEN_ADDRESS, checkSummedAddress)) {
        return baseURIs.map((x) => `${x}/info/logo.png`)
    }

    const specialIcon = SPECIAL_ICON_LIST.find(currySameAddress(address))

    if (specialIcon) return [specialIcon.logo_url]

    const fullIconAssetURIs = baseURIs.map((x) => `${x}/assets/${checkSummedAddress}/logo.png`)
    return logoURI ? [logoURI] : fullIconAssetURIs
}
//#endregion

const useStyles = makeStyles((theme: Theme) => ({
    icon: {
        width: 36,
        height: 36,
        backgroundColor: theme.palette.common.white,
        margin: 0,
    },
}))

export interface TokenIconProps extends withClasses<never> {
    name?: string
    logoURI?: string
    chainId?: ChainId
    address: string
    AvatarProps?: Partial<AvatarProps>
}

export function TokenIcon(props: TokenIconProps) {
    const { address, logoURI, name, chainId, AvatarProps } = props

    const classes = useStylesExtends(useStyles(), props)
    const chainDetailed = useChainDetailed()
    const tokenBlockie = useBlockie(address)
    const tokenAssetBaseURI = useConstantNext(CONSTANTS, chainId).TOKEN_ASSET_BASE_URI

    const tokenURIs = resolveTokenIconURLs(address, tokenAssetBaseURI, chainId ?? ChainId.Mainnet, logoURI)
    const { value: baseURI, loading } = useImageFailover(chainDetailed ? tokenURIs : [], '')

    return (
        <Avatar className={classes.icon} src={loading ? '' : baseURI} {...AvatarProps}>
            <Avatar className={classes.icon} src={tokenBlockie}>
                {name?.substr(0, 1).toLocaleUpperCase()}
            </Avatar>
        </Avatar>
    )
}
