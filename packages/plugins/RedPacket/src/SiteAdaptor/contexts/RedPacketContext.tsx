import { t } from '@lingui/core/macro'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMChainResolver } from '@masknet/web3-providers'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { multipliedBy, rightShift, type FungibleToken, type NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, GasConfig, SchemaType } from '@masknet/web3-shared-evm'
import { noop, omit } from 'lodash-es'
import {
    createContext,
    memo,
    useContext,
    useMemo,
    useState,
    type Dispatch,
    type PropsWithChildren,
    type SetStateAction,
} from 'react'
import { DURATION, PRESET_THEMES, RED_PACKET_DEFAULT_SHARES } from '../../constants.js'
import type { RedPacketSettings } from '../hooks/useCreateCallback.js'
import type { Web3Helper } from '@masknet/web3-helpers'

export enum ConditionType {
    Crypto = 'Crypto',
    NFT = 'NFT',
}

interface RedPacketContextOptions {
    gasOption: GasConfig | undefined
    setGasOption: Dispatch<SetStateAction<GasConfig | undefined>>
    theme: FireflyRedPacketAPI.ThemeGroupSettings | undefined
    themes: FireflyRedPacketAPI.ThemeGroupSettings[]
    setTheme: Dispatch<SetStateAction<FireflyRedPacketAPI.ThemeGroupSettings | undefined>>
    customThemes: FireflyRedPacketAPI.ThemeGroupSettings[]
    setCustomThemes: Dispatch<SetStateAction<FireflyRedPacketAPI.ThemeGroupSettings[]>>
    message: string
    setMessage: Dispatch<SetStateAction<string>>
    creator: string
    conditions: ConditionType[]
    setConditions: Dispatch<SetStateAction<ConditionType[]>>
    tokenQuantity: string
    setTokenQuantity: Dispatch<SetStateAction<string>>
    requiredTokens: Array<FungibleToken<ChainId, SchemaType>>
    setRequiredTokens: Dispatch<SetStateAction<Array<FungibleToken<ChainId, SchemaType>>>>
    requiredCollections: Array<NonFungibleCollection<ChainId, SchemaType>>
    setRequiredCollections: Dispatch<SetStateAction<Array<NonFungibleCollection<ChainId, SchemaType>>>>
    needHoldingTokens: boolean
    needHoldingCollections: boolean
    claimStrategies: FireflyRedPacketAPI.StrategyPayload[]
    // Token
    token: FungibleToken<ChainId, SchemaType> | undefined
    setToken: Dispatch<SetStateAction<FungibleToken<ChainId, SchemaType> | undefined>>
    nativeToken: FungibleToken<ChainId, SchemaType>
    rawAmount: string
    setRawAmount: Dispatch<SetStateAction<string>>
    settings: RedPacketSettings
    isRandom: boolean
    setIsRandom: Dispatch<SetStateAction<boolean>>
    shares: number
    setShares: Dispatch<SetStateAction<number>>
    // NFT
    nftGasOption: GasConfig | undefined
    setNftGasOption: Dispatch<SetStateAction<GasConfig | undefined>>
    selectedNfts: Web3Helper.NonFungibleAssetAll[]
    setSelectedNfts: Dispatch<SetStateAction<Web3Helper.NonFungibleAssetAll[]>>
    collection: Web3Helper.NonFungibleCollectionAll | undefined
    setCollection: Dispatch<SetStateAction<Web3Helper.NonFungibleCollectionAll | undefined>>
}
export const RedPacketContext = createContext<RedPacketContextOptions>({
    gasOption: undefined,
    setGasOption: noop,
    theme: undefined,
    themes: EMPTY_LIST,
    setTheme: noop,
    customThemes: EMPTY_LIST,
    setCustomThemes: noop,
    message: '',
    setMessage: noop,
    creator: '',
    conditions: EMPTY_LIST,
    setConditions: noop,
    requiredTokens: EMPTY_LIST,
    setRequiredTokens: noop,
    tokenQuantity: '',
    setTokenQuantity: noop,
    requiredCollections: EMPTY_LIST,
    setRequiredCollections: noop,
    needHoldingTokens: false,
    needHoldingCollections: false,
    claimStrategies: EMPTY_LIST,
    // Token
    token: undefined,
    setToken: noop,
    nativeToken: null!,
    rawAmount: '',
    setRawAmount: noop,
    settings: null!,
    isRandom: true,
    setIsRandom: noop,
    shares: 0,
    setShares: noop,
    // NFT
    nftGasOption: undefined,
    setNftGasOption: noop,
    selectedNfts: EMPTY_LIST,
    setSelectedNfts: noop,
    collection: undefined,
    setCollection: noop,
})

interface Props extends PropsWithChildren {}

export const RedPacketProvider = memo(function RedPacketProvider({ children }: Props) {
    const [gasOption, setGasOption] = useState<GasConfig>()
    const [theme = PRESET_THEMES[0], setTheme] = useState<FireflyRedPacketAPI.ThemeGroupSettings>()
    const [customThemes, setCustomThemes] = useState<FireflyRedPacketAPI.ThemeGroupSettings[]>([])
    const [message, setMessage] = useState('')

    const allThemes = useMemo(
        () => (customThemes ? [...PRESET_THEMES, ...customThemes] : PRESET_THEMES),
        [customThemes],
    )
    const [conditions, setConditions] = useState<ConditionType[]>([])
    const [tokenQuantity, setTokenQuantity] = useState('')
    const [requiredTokens, setRequiredTokens] = useState<Array<FungibleToken<ChainId, SchemaType>>>([])
    const [requiredCollections, setRequiredCollections] = useState<Array<NonFungibleCollection<ChainId, SchemaType>>>(
        [],
    )

    const needHoldingTokens = conditions.includes(ConditionType.Crypto) && requiredTokens.length > 0
    const needHoldingCollections = conditions.includes(ConditionType.NFT) && requiredCollections.length > 0

    const claimStrategies = useMemo(() => {
        const list: FireflyRedPacketAPI.StrategyPayload[] = []
        if (needHoldingTokens) {
            list.push({
                type: FireflyRedPacketAPI.StrategyType.tokens,
                payload: requiredTokens.map((token) => ({
                    chainId: token.chainId.toString(),
                    contractAddress: token.address,
                    name: token.name,
                    symbol: token.symbol,
                    decimals: token.decimals,
                    amount: tokenQuantity ? rightShift(tokenQuantity, token.decimals).toFixed(0, 1) : '0',
                    icon: token.logoURL,
                })) as FireflyRedPacketAPI.TokensStrategyPayload[],
            })
            return list
        }
        if (needHoldingCollections) {
            list.push({
                type: FireflyRedPacketAPI.StrategyType.nftOwned,
                payload: requiredCollections.map((collection) => ({
                    chainId: collection.chainId.toString(),
                    contractAddress: collection.address!,
                    collectionName: collection.name || collection.symbol || '',
                    icon: collection.iconURL!,
                })),
            })
            return list
        }
        return list
    }, [needHoldingTokens, requiredTokens, requiredCollections, tokenQuantity])

    // Token
    const [rawAmount, setRawAmount] = useState('')
    const [isRandom, setIsRandom] = useState<boolean>(true)
    const [shares, setShares] = useState<number>(RED_PACKET_DEFAULT_SHARES)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const nativeToken = useMemo(() => EVMChainResolver.nativeCurrency(chainId), [chainId])
    const [token = nativeToken, setToken] = useState<FungibleToken<ChainId, SchemaType>>()

    const myIdentity = useLastRecognizedIdentity()
    const creator = myIdentity?.identifier?.userId || 'Unknown User'

    const amount = rightShift(rawAmount || '0', token?.decimals)
    const totalAmount = useMemo(() => multipliedBy(amount, isRandom ? 1 : (shares ?? '0')), [amount, shares, isRandom])
    const settings: RedPacketSettings = useMemo(
        () => ({
            duration: DURATION,
            isRandom,
            name: creator,
            message: message || t`Best Wishes!`,
            shares: shares || 0,
            token:
                token ?
                    (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>)
                :   undefined,
            total: totalAmount.toFixed(),
        }),
        [isRandom, creator, message, shares, token, totalAmount],
    )

    // NFT
    const [nftGasOption, setNftGasOption] = useState<GasConfig>()
    const [selectedNfts, setSelectedNfts] = useState<Web3Helper.NonFungibleAssetAll[]>([])
    const [collection, setCollection] = useState<Web3Helper.NonFungibleCollectionAll>()

    const contextValue = useMemo(() => {
        return {
            gasOption,
            setGasOption,
            themes: allThemes,
            theme,
            setTheme,
            customThemes,
            setCustomThemes,
            message,
            setMessage,
            creator,
            conditions,
            setConditions,
            tokenQuantity,
            setTokenQuantity,
            requiredTokens,
            setRequiredTokens,
            requiredCollections,
            setRequiredCollections,
            needHoldingTokens,
            needHoldingCollections,
            claimStrategies,

            // Token
            token,
            setToken,
            nativeToken,
            rawAmount,
            setRawAmount,
            settings,
            isRandom,
            setIsRandom,
            shares,
            setShares,
            // NFT
            nftGasOption,
            setNftGasOption,
            selectedNfts,
            setSelectedNfts,
            collection,
            setCollection,
        }
    }, [
        gasOption,
        theme,
        allThemes,
        customThemes,
        settings,
        message,
        token,
        nativeToken,
        rawAmount,
        creator,
        conditions,
        tokenQuantity,
        requiredTokens,
        requiredCollections,
        needHoldingTokens,
        needHoldingCollections,
        claimStrategies,
        isRandom,
        shares,
        collection,
        nftGasOption,
        selectedNfts,
    ])

    return <RedPacketContext.Provider value={contextValue}>{children}</RedPacketContext.Provider>
})

export function useRedPacket() {
    return useContext(RedPacketContext)
}
