import { t } from '@lingui/core/macro'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMChainResolver } from '@masknet/web3-providers'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { multipliedBy, rightShift, type FungibleToken } from '@masknet/web3-shared-base'
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

export enum ConditionType {
    Crypto = 'Crypto',
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
    needHoldingTokens: boolean
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
    needHoldingTokens: false,
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
})
RedPacketContext.displayName = 'RedPacketContext'

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

    const needHoldingTokens = conditions.includes(ConditionType.Crypto) && requiredTokens.length > 0

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
        return list
    }, [needHoldingTokens, requiredTokens, tokenQuantity])

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
            needHoldingTokens,
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
        needHoldingTokens,
        claimStrategies,
        isRandom,
        shares,
    ])

    return <RedPacketContext value={contextValue}>{children}</RedPacketContext>
})

export function useRedPacket() {
    return useContext(RedPacketContext)
}
