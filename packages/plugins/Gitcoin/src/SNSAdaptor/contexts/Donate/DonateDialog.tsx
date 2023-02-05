import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import {
    EthereumERC20TokenApprovedBoundary,
    FungibleTokenInput,
    InjectedDialog,
    InjectedDialogProps,
    NetworkTab,
    PluginWalletStatusBar,
    TokenIcon,
    useSelectFungibleToken,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { EMPTY_LIST, isTwitter, NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { useChainContext, useFungibleTokenBalance, useWeb3Connection } from '@masknet/web3-hooks-base'
import { formatBalance, FungibleToken, rightShift, ZERO } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, useGitcoinConstants } from '@masknet/web3-shared-evm'
import { DialogActions, DialogContent, Typography } from '@mui/material'
import { FC, memo, useCallback, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { useDonateCallback } from '../../hooks/useDonateCallback.js'
import { useI18N } from '../../../locales/i18n_generated.js'
import type { GitcoinGrant } from '../../../apis/index.js'
import { Icons } from '@masknet/icons'
import { GiveBackSelect } from './GiveBackSelect.js'
import { BigNumber } from 'bignumber.js'
import { useShowResult } from '../ResultModal/index.js'

const useStyles = makeStyles()((theme) => ({
    banner: {},
    bannerImage: {
        width: '100%',
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

const availableChains = [ChainId.Mainnet, ChainId.Matic]
export const DonateDialog: FC<DonateDialogProps> = memo(({ onSubmit, grant, ...rest }) => {
    const t = useI18N()
    const { classes, theme } = useStyles()
    const { title, admin_address: address } = grant
    const { share } = useSNSAdaptorContext()

    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const nativeTokenDetailed = useAsync(async () => {
        return connection?.getNativeToken({ chainId })
    }, [chainId])

    const { BULK_CHECKOUT_ADDRESS } = useGitcoinConstants(chainId)

    // #region the selected token
    const [tokenMap, setTokenMap] = useState<Partial<Record<ChainId, FungibleToken<ChainId, SchemaType>>>>({})
    const token = tokenMap[chainId] ?? nativeTokenDetailed.value

    const tokenBalance = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, token?.address)

    // #region select token dialog
    const selectFungibleToken = useSelectFungibleToken<void, NetworkPluginID.PLUGIN_EVM>()
    const onSelectTokenChipClick = useCallback(async () => {
        const pickedToken = await selectFungibleToken({
            disableNativeToken: false,
            selectedTokens: token?.address ? [token.address] : EMPTY_LIST,
            enableManage: false,
        })
        if (pickedToken) setTokenMap((map) => ({ ...map, [chainId]: pickedToken }))
    }, [selectFungibleToken, token?.address, chainId])
    // #endregion

    // #region form
    const [rawAmount, setRawAmount] = useState('')
    const amount = rightShift(rawAmount || '0', token?.decimals)
    const [giveBack, setGiveBack] = useState<number>(0.05)
    const tipAmount = amount.gt(0) ? new BigNumber(amount).times(giveBack) : ZERO
    const total = rawAmount ? new BigNumber(rawAmount).times(1 + giveBack).toFixed() : '0'
    // #endregion

    // #region blocking
    const [{ loading }, donateCallback] = useDonateCallback(address ?? '', amount.toFixed(), tipAmount.toFixed(), token)
    // #endregion

    const showConfirm = useShowResult()
    const donate = useCallback(async () => {
        const hash = await donateCallback()
        if (typeof hash !== 'string') return
        const cashTag = isTwitter() ? '$' : ''
        if (!token) return
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

    // #region submit button
    const validationMessage = useMemo(() => {
        if (!token) return t.select_a_token()
        if (!account) return t.plugin_wallet_connect_a_wallet()
        if (!address) return t.grant_not_available()
        if (!amount || amount.isZero()) return t.enter_an_amount()
        if (amount.isGreaterThan(tokenBalance.value ?? '0'))
            return t.insufficient_balance({
                symbol: token.symbol,
            })
        return ''
    }, [account, address, amount.toFixed(), chainId, token, tokenBalance.value ?? '0'])
    // #endregion

    if (!token || !address) return null

    return (
        <InjectedDialog {...rest} title={grant.title} maxWidth="xs">
            <DialogContent style={{ padding: 16 }}>
                <div className={classes.banner}>
                    <img className={classes.bannerImage} src={grant.logo_url} />
                </div>
                <form className={classes.form} noValidate autoComplete="off">
                    <NetworkTab pluginID={NetworkPluginID.PLUGIN_EVM} chains={availableChains} />
                    <FungibleTokenInput
                        label={t.amount()}
                        amount={rawAmount}
                        balance={tokenBalance.value ?? '0'}
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
                                {total}
                            </Typography>
                            <TokenIcon chainId={chainId} address={token.address} size={18} />
                            <Typography ml={1}>{token.symbol}</Typography>
                        </div>
                    </div>
                </form>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <PluginWalletStatusBar>
                    <WalletConnectedBoundary>
                        <EthereumERC20TokenApprovedBoundary
                            classes={{ button: classes.button }}
                            amount={amount.toFixed()}
                            spender={BULK_CHECKOUT_ADDRESS}
                            token={token.schema === SchemaType.ERC20 ? token : undefined}>
                            <ActionButton
                                className={classes.button}
                                loading={loading}
                                fullWidth
                                size="large"
                                disabled={!!validationMessage || loading}
                                onClick={donate}>
                                {validationMessage || t.donate()}
                            </ActionButton>
                        </EthereumERC20TokenApprovedBoundary>
                    </WalletConnectedBoundary>
                </PluginWalletStatusBar>
            </DialogActions>
        </InjectedDialog>
    )
})
