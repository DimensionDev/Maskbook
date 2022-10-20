import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BigNumber from 'bignumber.js'
import { omit } from 'lodash-unified'
import { makeStyles, useStylesExtends, ActionButton } from '@masknet/theme'
import {
    FungibleToken,
    isGreaterThan,
    isZero,
    multipliedBy,
    rightShift,
    formatBalance,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { MenuItem, Select, Box, InputBase, Typography } from '@mui/material'
import { NetworkPluginID } from '@masknet/shared-base'
import { useSelectFungibleToken, FungibleTokenInput } from '@masknet/shared'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI.js'
import { useI18N } from '../locales/index.js'
import { PluginWalletStatusBar, useI18N as useBaseI18n } from '../../../utils/index.js'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary.js'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary.js'
import { RED_PACKET_DEFAULT_SHARES, RED_PACKET_MAX_SHARES, RED_PACKET_MIN_SHARES } from '../constants.js'
import type { RedPacketSettings } from './hooks/useCreateCallback.js'
import { useAccount, useChainId, useFungibleToken, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary.js'

// seconds of 1 day
const duration = 60 * 60 * 24

const useStyles = makeStyles()((theme) => ({
    field: {
        display: 'flex',
        gap: 16,
        margin: 16,
    },
    input: {
        flex: 1,
    },
    button: {
        margin: 0,
        padding: 0,
        height: 40,
    },
    unlockContainer: {
        margin: 0,
        columnGap: 16,
        flexFlow: 'unset',
        ['& > div']: {
            padding: '0px !important',
        },
    },
}))

export interface RedPacketFormProps extends withClasses<never> {
    onChange(settings: RedPacketSettings): void
    onClose: () => void
    origin?: RedPacketSettings
    onNext: () => void
    setERC721DialogHeight?: (height: number) => void
}

export function RedPacketERC20Form(props: RedPacketFormProps) {
    const t = useI18N()
    const { t: tr } = useBaseI18n()
    const classes = useStylesExtends(useStyles(), props)
    const { onChange, onNext, origin } = props
    // context
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)

    // #region select token
    const { value: nativeTokenDetailed } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, undefined, { chainId })
    const [token = nativeTokenDetailed, setToken] = useState<FungibleToken<ChainId, SchemaType> | undefined>(
        origin?.token,
    )

    const selectFungibleToken = useSelectFungibleToken(NetworkPluginID.PLUGIN_EVM)
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await selectFungibleToken({
            disableNativeToken: false,
            selectedTokens: token ? [token.address] : [],
            chainId,
        })
        if (picked) setToken(picked)
    }, [selectFungibleToken, token?.address, chainId])
    // #endregion

    // #region packet settings
    const [isRandom, setRandom] = useState(origin?.isRandom ? 1 : 0)
    const [message, setMessage] = useState(origin?.message || t.best_wishes())
    const currentIdentity = useCurrentIdentity()

    const { value: linkedPersona } = useCurrentLinkedPersona()

    const senderName = currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? 'Unknown User'

    // shares
    const [shares, setShares] = useState<number | ''>(origin?.shares || RED_PACKET_DEFAULT_SHARES)
    const onShareChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const shares_ = ev.currentTarget.value.replace(/[,.]/g, '')
            if (shares_ === '') setShares('')
            else if (/^[1-9]+\d*$/.test(shares_)) {
                const parsed = Number.parseInt(shares_, 10)
                if (parsed >= RED_PACKET_MIN_SHARES && parsed <= RED_PACKET_MAX_SHARES)
                    setShares(Number.parseInt(shares_, 10))
            }
        },
        [RED_PACKET_MIN_SHARES, RED_PACKET_MAX_SHARES],
    )

    // amount
    const [rawAmount, setRawAmount] = useState(
        origin?.isRandom
            ? formatBalance(origin?.total, origin.token?.decimals ?? 0)
            : formatBalance(new BigNumber(origin?.total ?? '0').div(origin?.shares ?? 1), origin?.token?.decimals ?? 0),
    )
    const amount = rightShift(rawAmount || '0', token?.decimals)
    const totalAmount = useMemo(() => multipliedBy(amount, isRandom ? 1 : shares ?? '0'), [amount, shares])
    const isDivisible = !totalAmount.dividedBy(shares).isLessThan(1)

    useEffect(() => {
        setToken(nativeTokenDetailed as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>)
    }, [chainId, nativeTokenDetailed])

    useEffect(() => {
        setRawAmount('0')
    }, [token])

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        token?.address ?? '',
        { chainId },
    )
    // #endregion

    const validationMessage = useMemo(() => {
        if (!token) return t.select_a_token()
        if (!account) return tr('plugin_wallet_connect_a_wallet')
        if (isZero(shares || '0')) return 'Enter shares'
        if (isGreaterThan(shares || '0', 255)) return 'At most 255 recipients'
        if (isZero(amount)) return tr('plugin_dhedge_enter_an_amount')
        if (isGreaterThan(totalAmount, tokenBalance))
            return tr('plugin_gitcoin_insufficient_balance', { symbol: token.symbol })
        if (!isDivisible)
            return t.indivisible({
                symbol: token.symbol!,
                amount: formatBalance(1, token.decimals),
            })
        return ''
    }, [account, amount, totalAmount, shares, token, tokenBalance, t, tr])

    const creatingParams = useMemo(
        () => ({
            duration,
            isRandom: Boolean(isRandom),
            name: senderName,
            message: message || t.best_wishes(),
            shares: shares || 0,
            token: token
                ? (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>)
                : undefined,
            total: totalAmount.toFixed(),
        }),
        [isRandom, senderName, message, t, shares, token, totalAmount],
    )

    const onClick = useCallback(() => {
        onChange(creatingParams)
        onNext()
    }, [creatingParams, onChange, onNext])

    const selectRef = useRef(null)

    if (!token) return null
    return (
        <>
            <div className={classes.field}>
                <Box className={classes.input}>
                    <Typography>{t.split_mode()}</Typography>
                    <Select
                        fullWidth
                        className={classes.input}
                        ref={selectRef}
                        value={isRandom ? 1 : 0}
                        onChange={(e) => {
                            // foolproof, reset amount since the meaning of amount changed:
                            // 'total amount' <=> 'amount per share'
                            setRawAmount('0')
                            setRandom(e.target.value as number)
                        }}
                        MenuProps={{
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'center',
                            },
                            container: selectRef.current,
                            anchorEl: selectRef.current,
                        }}>
                        <MenuItem value={0}>{t.average()}</MenuItem>
                        <MenuItem value={1}>{t.random()}</MenuItem>
                    </Select>
                </Box>
                <Box className={classes.input}>
                    <Typography>{t.shares()}</Typography>
                    <InputBase
                        fullWidth
                        value={shares}
                        onChange={onShareChange}
                        inputProps={{
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            placeholder: '0',
                            pattern: '^[0-9]$',
                            spellCheck: false,
                        }}
                    />
                </Box>
            </div>
            <div className={classes.field}>
                <FungibleTokenInput
                    label={isRandom ? 'Total Amount' : t.amount_per_share()}
                    token={token}
                    onSelectToken={onSelectTokenChipClick}
                    onAmountChange={setRawAmount}
                    amount={rawAmount}
                    balance={tokenBalance}
                    maxAmountShares={isRandom || shares === '' ? 1 : shares}
                />
            </div>
            <Box margin={2}>
                <Typography>{t.attached_message()}</Typography>
                <InputBase
                    fullWidth
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.best_wishes()}
                    value={message}
                />
            </Box>
            <Box style={{ width: '100%' }}>
                <PluginWalletStatusBar>
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        expectedChainId={chainId}
                        forceShowingWrongNetworkButton>
                        <WalletConnectedBoundary>
                            <EthereumERC20TokenApprovedBoundary
                                onlyInfiniteUnlock
                                amount={totalAmount.toFixed()}
                                classes={{ container: classes.unlockContainer }}
                                ActionButtonProps={{
                                    size: 'medium',
                                }}
                                token={
                                    token?.schema === SchemaType.ERC20 && totalAmount.gt(0) && !validationMessage
                                        ? token
                                        : undefined
                                }
                                spender={HAPPY_RED_PACKET_ADDRESS_V4}>
                                <ActionButton
                                    size="large"
                                    className={classes.button}
                                    fullWidth
                                    disabled={!!validationMessage}
                                    onClick={onClick}>
                                    {validationMessage || t.next()}
                                </ActionButton>
                            </EthereumERC20TokenApprovedBoundary>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </PluginWalletStatusBar>
            </Box>
        </>
    )
}
