import { BigNumber } from 'bignumber.js'
import { memo, useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { Icons } from '@masknet/icons'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import {
    ChainBoundary,
    EthereumERC20TokenApprovedBoundary,
    FungibleTokenInput,
    InjectedDialog,
    type InjectedDialogProps,
    NetworkTab,
    PluginWalletStatusBar,
    TokenIcon,
    useSelectFungibleToken,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { ActionButton, makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { Web3 } from '@masknet/web3-providers'
import { useChainContext, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { formatBalance, type FungibleToken, rightShift, ZERO } from '@masknet/web3-shared-base'
import { type ChainId, isNativeTokenAddress, SchemaType, useGitcoinConstants } from '@masknet/web3-shared-evm'
import { Box, DialogActions, DialogContent, Typography } from '@mui/material'
import { useDonateCallback } from '../../hooks/useDonateCallback.js'
import { useI18N } from '../../../locales/i18n_generated.js'
import type { GitcoinGrant } from '../../../apis/index.js'
import { GiveBackSelect } from './GiveBackSelect.js'
import { useShowResult } from '../ResultModal/index.js'
import { getSupportedChainIds } from '../../../utils.js'

const useStyles = makeStyles()((theme) => ({
    banner: {},
    bannerImage: {
        width: '100%',
        maxWidth: '100%',
        maxHeight: 176,
        objectFit: 'cover',
        borderRadius: theme.spacing(1.5),
    },
    input: {
        marginTop: 36,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: theme.spacing(2),
    },
    rowLabel: {
        marginRight: 'auto',
        display: 'flex',
        alignItems: 'center',
    },
    giveBackSelect: {
        width: 80,
    },
    contribution: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        margin: 0,
        padding: 0,
        height: 40,
    },
    actions: {
        padding: '0 !important',
    },
}))

export interface DonateDialogProps extends InjectedDialogProps {
    onSubmit?(): void
    grant: GitcoinGrant
}

export const DonateDialog = memo(({ onSubmit, grant, ...rest }: DonateDialogProps) => {
    const t = useI18N()
    const { classes, theme } = useStyles()
    const { title, admin_address: address, tenants } = grant
    const { share } = useSNSAdaptorContext()

    const availableChains = useMemo(() => getSupportedChainIds(tenants), [tenants])
    const { account, chainId, setChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    useLayoutEffect(() => {
        if (!availableChains.includes(chainId)) setChainId(availableChains[0])
    }, [chainId, setChainId, availableChains])

    const nativeTokenDetailed = useAsync(async () => {
        return Web3.getNativeToken({ chainId })
    }, [chainId])

    const { BULK_CHECKOUT_ADDRESS, TOKEN_LIST } = useGitcoinConstants(chainId)

    // #region the selected token
    const [tokenMap, setTokenMap] = useState<Partial<Record<ChainId, FungibleToken<ChainId, SchemaType>>>>({})
    const token = tokenMap[chainId] ?? nativeTokenDetailed.value

    const tokenBalance = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, token?.address)

    // #region select token dialog
    const selectFungibleToken = useSelectFungibleToken<void, NetworkPluginID.PLUGIN_EVM>()
    const onSelectTokenChipClick = useCallback(async () => {
        const pickedToken = await selectFungibleToken({
            chainId,
            whitelist: TOKEN_LIST,
            disableNativeToken: false,
            selectedTokens: token?.address ? [token.address] : EMPTY_LIST,
            enableManage: false,
        })
        if (pickedToken) setTokenMap((map) => ({ ...map, [chainId]: pickedToken }))
    }, [selectFungibleToken, token?.address, chainId, TOKEN_LIST])
    // #endregion

    // #region form
    const [rawAmount, setRawAmount] = useState('')
    const amount = useMemo(
        () => rightShift(rawAmount || '0', token?.decimals).integerValue(),
        [rawAmount, token?.decimals],
    )
    const [giveBack, setGiveBack] = useState<number>(0.05)
    const tipAmount = useMemo(() => new BigNumber(amount).times(giveBack).integerValue(), [amount, giveBack])
    const total = amount.plus(tipAmount)
    // #endregion

    // #region blocking
    const [{ loading }, { value: gasFee = '1' }, donateCallback] = useDonateCallback(
        address ?? '',
        amount.toFixed(0),
        tipAmount.toFixed(0),
        token,
    )
    // #endregion

    const showConfirm = useShowResult()
    const donate = useCallback(async () => {
        if (!token) return
        const hash = await donateCallback()
        if (typeof hash !== 'string') return
        const cashTag = Sniffings.is_twitter_page ? '$' : ''
        const uiAmount = formatBalance(amount.plus(tipAmount), token.decimals)
        const shareText = t.share_text({
            amount: uiAmount,
            symbol: `${cashTag}${token.symbol}`,
            grant_name: title,
        })
        await showConfirm({
            token,
            uiAmount,
            onShare() {
                share?.(shareText)
            },
        })

        // clean up dialog
        setRawAmount('')
    }, [showConfirm, amount, tipAmount, token, donateCallback, t, title])

    const balance = new BigNumber(tokenBalance.value ?? '0')
    const availableBalance = useMemo(() => {
        if (!isNativeTokenAddress(token?.address)) return balance
        // Add gas padding.
        return balance.gt(gasFee) ? balance.minus(new BigNumber(gasFee).times(2)) : ZERO
    }, [token?.address, balance.toFixed(), gasFee])
    const maxAmount = availableBalance.div(1 + giveBack).toFixed(0)

    // #region submit button
    const insufficientBalance = total.gt(availableBalance)
    const validationMessage = useMemo(() => {
        if (!token) return t.select_a_token()
        if (!account) return t.plugin_wallet_connect_a_wallet()
        if (!address) return t.grant_not_available()
        if (!amount || amount.isZero()) return t.enter_an_amount()
        if (insufficientBalance)
            return t.insufficient_balance({
                symbol: token.symbol,
            })
        return ''
    }, [account, address, amount.toFixed(0), chainId, token, insufficientBalance])
    // #endregion

    if (!token || !address) return null

    return (
        <InjectedDialog {...rest} title={t.donate_dialog_title()} maxWidth="xs">
            <DialogContent style={{ padding: 16 }}>
                {grant.logo_url ? (
                    <div className={classes.banner}>
                        <img className={classes.bannerImage} src={grant.logo_url} />
                    </div>
                ) : null}
                <form noValidate autoComplete="off">
                    <Box ml={-1.5}>
                        <NetworkTab pluginID={NetworkPluginID.PLUGIN_EVM} chains={availableChains} />
                    </Box>
                    <FungibleTokenInput
                        label={t.amount()}
                        amount={rawAmount}
                        maxAmount={maxAmount}
                        balance={availableBalance.toFixed(0)}
                        token={token}
                        onAmountChange={setRawAmount}
                        onSelectToken={onSelectTokenChipClick}
                        loadingBalance={tokenBalance.loading}
                        className={classes.input}
                    />
                    <div className={classes.row}>
                        <Typography
                            className={classes.rowLabel}
                            fontSize={16}
                            lineHeight="20px"
                            color={theme.palette.maskColor.main}>
                            {t.give_back_to_match_pool()}
                            <ShadowRootTooltip title={t.give_back_tooltip()} placement="top">
                                <Icons.Info color={theme.palette.maskColor.second} size={20} sx={{ ml: 1 }} />
                            </ShadowRootTooltip>
                        </Typography>
                        <GiveBackSelect
                            value={giveBack}
                            className={classes.giveBackSelect}
                            onChange={(e) => {
                                setGiveBack(Number.parseFloat(e.target.value as string))
                            }}
                        />
                    </div>
                    <div className={classes.row}>
                        <Typography
                            className={classes.rowLabel}
                            fontSize={16}
                            lineHeight="20px"
                            color={theme.palette.maskColor.second}>
                            {t.total_contribution()}
                        </Typography>
                        <div className={classes.contribution}>
                            <Typography mr={1} fontSize={24} fontWeight={700}>
                                {formatBalance(total, token.decimals, 6)}
                            </Typography>
                            <TokenIcon chainId={chainId} address={token.address} size={18} />
                            <Typography ml={1}>{token.symbol}</Typography>
                        </div>
                    </div>
                </form>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <PluginWalletStatusBar>
                    <WalletConnectedBoundary expectedChainId={chainId}>
                        <EthereumERC20TokenApprovedBoundary
                            classes={{ button: classes.button }}
                            amount={total.toFixed(0)}
                            spender={BULK_CHECKOUT_ADDRESS}
                            token={token.schema === SchemaType.ERC20 ? token : undefined}>
                            <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                                <ActionButton
                                    className={classes.button}
                                    loading={loading}
                                    fullWidth
                                    size="large"
                                    startIcon={<Icons.ConnectWallet size={18} />}
                                    disabled={!!validationMessage || loading}
                                    onClick={donate}>
                                    {validationMessage || t.donate()}
                                </ActionButton>
                            </ChainBoundary>
                        </EthereumERC20TokenApprovedBoundary>
                    </WalletConnectedBoundary>
                </PluginWalletStatusBar>
            </DialogActions>
        </InjectedDialog>
    )
})
