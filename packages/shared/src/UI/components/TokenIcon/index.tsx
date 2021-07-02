import { memo } from 'react'
import {
    ChainId,
    currySameAddress,
    formatEthereumAddress,
    getTokenConstants,
    isSameAddress,
    useBlockie,
    useChainDetailed,
    useChainId,
    useTokenAssetBaseURLConstants,
} from '@masknet/web3-shared'
import { makeStyles, Avatar, Theme, AvatarProps } from '@material-ui/core'
import { useImageFailOver } from '../../index'
import SPECIAL_ICON_LIST from './TokenIconSpecialIconList.json'
import { useStylesExtends } from '../../UIHelper/custom-ui-helper'

//#region fix icon image
function resolveTokenIconURLs(address: string, baseURIs: string[], chainId: ChainId, logoURI?: string) {
    const checkSummedAddress = formatEthereumAddress(address)

    if (isSameAddress(getTokenConstants().NATIVE_TOKEN_ADDRESS, checkSummedAddress)) {
        return baseURIs.map((x) => `${x}/info/logo.png`)
    }

    const specialIcon = SPECIAL_ICON_LIST.find(currySameAddress(address))

    if (specialIcon) return [specialIcon.logo_url]

    // load from remote
    const fullIconAssetURIs = baseURIs.map((x) => `${x}/assets/${checkSummedAddress}/logo.png`)
    return logoURI ? [logoURI] : fullIconAssetURIs
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
    logoURI?: string
    chainId?: ChainId
    address: string
    AvatarProps?: Partial<AvatarProps>
}

export function TokenIcon(props: TokenIconProps) {
    const { address, logoURI, name, chainId, AvatarProps, classes } = props

    const chainId_ = useChainId()
    const chainDetailed = useChainDetailed()
    const tokenBlockie = useBlockie(address)
    const { TOKEN_ASSET_BASE_URI } = useTokenAssetBaseURLConstants(chainId)
    const tokenURIs = resolveTokenIconURLs(address, TOKEN_ASSET_BASE_URI, chainId ?? chainId_, logoURI)
    const { value: logoURL, loading } = useImageFailOver(chainDetailed ? tokenURIs : [], '')

    return (
        <TokenIconUI
            logoURL={logoURL}
            loading={loading}
            AvatarProps={AvatarProps}
            tokenBlockie={tokenBlockie}
            classes={classes}
            name={name}
        />
    )
}

export interface TokenIconUIProps extends withClasses<never> {
    logoURL?: string
    loading: boolean
    AvatarProps?: Partial<AvatarProps>
    tokenBlockie: string
    name?: string
}

export const TokenIconUI = memo<TokenIconUIProps>((props) => {
    const { logoURL, loading, AvatarProps, tokenBlockie, name } = props
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Avatar className={classes.icon} src={loading ? '' : logoURL} {...AvatarProps}>
            <Avatar className={classes.icon} src={tokenBlockie}>
                {name?.substr(0, 1).toLocaleUpperCase()}
            </Avatar>
        </Avatar>
    )
})
