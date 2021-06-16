import { makeStyles, Avatar, Theme, AvatarProps } from '@material-ui/core'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import {
    CONSTANTS,
    useBlockie,
    useChainDetailed,
    ChainId,
    useConstant,
    constantOfChain,
    isSameAddress,
} from '@dimensiondev/web3-shared'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useImageFailover } from '../../../utils'

const SPECIAL_ICON_ASSET_MAP: { [key: string]: string } = {
    '0x04abEdA201850aC0124161F037Efd70c74ddC74C': 'https://s2.coinmarketcap.com/static/img/coins/64x64/5841.png', // NEST
    '0x14de81C71B3F73874659082b971433514E201B27': 'https://etherscan.io/token/images/ykyctoken_32.png', // Yes KYC
    '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4': 'https://etherscan.io/token/images/compoundwrappedbtc_32.png', // cWBTC
    '0x0cB8D0B37C7487b11d57F1f33dEfA2B1d3cFccfE': 'https://etherscan.io/token/images/dank_32.png', // DANK
    '0x03e3f0c25965f13DbbC58246738C183E27b26a56': 'https://etherscan.io/token/images/disciplina_28.png', // DSCP
    '0x4F4f0Db4de903B88f2B1a2847971E231D54F8fd3': 'https://etherscan.io/token/images/geens_28.png', // GEE
    '0x009e864923b49263c7F10D19B7f8Ab7a9A5AAd33': 'https://etherscan.io/token/images/knoxstertoken_32.png?v=2', // FKX
    '0x075190c6130EA0a3A7E40802F1D77F4Ea8f38fE2': 'https://etherscan.io/token/images/nestyfi_32.png', // N0031
    '0xb0866289e870D2efc282406cF4123Df6E5BcB652': 'https://etherscan.io/token/images/nofaketoday_28.png', // NFC
    '0xEe9801669C6138E84bD50dEB500827b776777d28': 'https://etherscan.io/token/images/o3swaptoken_32.png',
    '0x9a642d6b3368ddc662CA244bAdf32cDA716005BC': 'https://etherscan.io/token/images/qtum_28.png', // QTUM
    '0x13cb85823f78Cff38f0B0E90D3e975b8CB3AAd64': 'https://etherscan.io/token/images/remiit_28.png', // REMI
    '0xB563300A3BAc79FC09B93b6F84CE0d4465A2AC27': 'https://etherscan.io/token/images/redcab_28.png', // REDC
    '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6': 'https://etherscan.io/token/images/Synthetixsbtc_32.png', // SBTC
    '0xC596bD09d652827b0106292D3e378D5938df4B12':
        'https://etherscan.io/token/images/009-TPT-Teleport-Token-Coin-Logo.png', // TPT
    '0xCed1A8529125D1bD06B54a7B01210df357D00885': 'https://etherscan.io/token/images/giraffage_28.png', // TRL
    '0x5f778ec4B31a506c1Dfd8b06F131E9B451a61D39': 'https://etherscan.io/token/images/udap_28.png', // UPX
    '0x056017c55aE7AE32d12AeF7C679dF83A85ca75Ff': 'https://etherscan.io/token/images/wyvern_28.png', // WYV
    '0x82BD526bDB718C6d4DD2291Ed013A5186cAE2DCa': 'https://etherscan.io/token/images/vdoc_28.png', // VDOC
    '0xea8b224eDD3e342DEb514C4176c2E72Bcce6fFF9': 'https://etherscan.io/token/images/redeemabledai_32.png?v=2', // rSAI
    '0xAC51066d7bEC65Dc4589368da368b212745d63E8': 'https://bscscan.com/token/images/alicetoken_32.png', // ALICE
    '0xACB8f52DC63BB752a51186D1c55868ADbFfEe9C1': 'https://bscscan.com/token/images/bunnypark_32.png', // BP
    '0x74926B3d118a63F6958922d3DC05eB9C6E6E00c6': 'https://bscscan.com/token/images/doggy_32.png', // DOGGY
    '0x14ACe3d3429408bFA8562099A253172913AD71bd': 'https://bscscan.com/token/images/dechart_32.png', // DCH
    '0x129e6d84c6CAb9b0c2F37aD1D14a9fe2E59DAb09': 'https://bscscan.com/token/images/frankenstein_32.png', // FRANK
    '0x0a3A21356793B49154Fd3BbE91CBc2A16c0457f5': 'https://bscscan.com/token/images/redfoxlabs_32.png', // RFOX
    '0x658A109C5900BC6d2357c87549B651670E5b0539': 'https://bscscan.com/token/images/forceprotocol_32.png', // FOR
    '0xECa41281c24451168a37211F0bc2b8645AF45092': 'https://bscscan.com/token/images/tokenpocket_32.png', // TPT
    '0x0E8D5504bF54D9E44260f8d153EcD5412130CaBb': 'https://bscscan.com/token/images/unicrypt-uncl_32.png', // UNCL
    '0x09a6c44c3947B69E2B45F4D51b67E6a39ACfB506': 'https://bscscan.com/token/images/unicrypt_32.png', // UNCX
    '0x8b303d5BbfBbf46F1a4d9741E491e06986894e18': 'https://bscscan.com/token/images/woonkly_32.png', // WOOP
    '0xb86AbCb37C3A4B64f74f59301AFF131a1BEcC787': 'https://bscscan.com/token/images/zilliqa_32.png', // ZIL
    '0xeD28A457A5A76596ac48d87C0f577020F6Ea1c4C': 'https://bscscan.com/token/images/ptokenbtc_32.png', // PBTC
}

//#region fix icon image
function resolveTokenIconURLs(address: string, baseURIs: string[], chainId: ChainId, logoURI?: string) {
    const checkSummedAddress = formatEthereumAddress(address)

    if (isSameAddress(constantOfChain(CONSTANTS, chainId).NATIVE_TOKEN_ADDRESS, checkSummedAddress)) {
        return baseURIs.map((x) => `${x}/info/logo.png`)
    }

    if (SPECIAL_ICON_ASSET_MAP[checkSummedAddress]) return [SPECIAL_ICON_ASSET_MAP[checkSummedAddress]]

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
    const { address, logoURI, name, chainId, AvatarProps } = props

    const classes = useStylesExtends(useStyles(), props)
    const chainDetailed = useChainDetailed()
    const tokenBlockie = useBlockie(address)
    const tokenAssetBaseURI = useConstant(CONSTANTS, 'TOKEN_ASSET_BASE_URI')

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
