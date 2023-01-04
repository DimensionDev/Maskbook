import { Icons } from '@masknet/icons'
import { ImageIcon, useSnackbarCallback, TokenIcon, FormattedBalance, useMenuConfig } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, NetworkPluginID, PluginID, PopupRoutes } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles, ShadowRootTooltip } from '@masknet/theme'
import {
    useChainContext,
    useFungibleAssets,
    useFungibleTokenBalance,
    useNetworkDescriptor,
    useWallets,
    useWeb3Connection,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import { formatEthereumAddress, ProviderType, SchemaType, useSmartPayConstants } from '@masknet/web3-shared-evm'
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    Link,
    List,
    ListItem,
    ListItemText,
    Radio,
    Typography,
} from '@mui/material'
import { useAsyncFn, useCopyToClipboard } from 'react-use'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { formatBalance, isLessThan, isSameAddress, Wallet } from '@masknet/web3-shared-base'
import { compact, first, isNaN } from 'lodash-es'
import { useI18N } from '../../locales/i18n_generated.js'
import { PluginSmartPayMessages } from '../../message.js'
import { useERC20TokenAllowance } from '@masknet/web3-hooks-evm'
import { AddSmartPayPopover } from './AddSmartPayPopover.js'
import { AccountsManagerPopover } from './AccountsManagePopover.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'

const useStyles = makeStyles()((theme) => ({
    dialogContent: {
        padding: theme.spacing(2),
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
    },
    dialogActions: {
        padding: '12px 12px 20px !important',
        display: 'flex',
        justifyContent: 'space-between',
        columnGap: 12,
        '& > *': {
            marginLeft: '0px !important',
            fontSize: 12,
        },
    },
    card: {
        background: theme.palette.maskColor.modalTitleBg,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        color: theme.palette.maskColor.main,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        right: -6,
        bottom: -4,
        border: `1px solid ${theme.palette.common.white}`,
        borderRadius: '50%',
    },
    address: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        columnGap: 2,
        marginTop: 4,
    },
    list: {
        marginTop: theme.spacing(1.5),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1),
        paddingTop: 0,
    },
    listItem: {
        backgroundColor: theme.palette.maskColor.bottom,
        borderRadius: 8,
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12)',
        padding: theme.spacing(2, 1.5),
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
        columnGap: 4,
    },
    balance: {
        textAlign: 'right',
        '& > span': {
            fontSize: 16,
            lineHeight: '20px',
            fontWeight: 700,
        },
    },
    maskGasTip: {
        color: theme.palette.maskColor.highlight,
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    linkIcon: {
        color: theme.palette.maskColor.second,
        cursor: 'pointer',
        height: 14,
    },
    menu: {
        padding: theme.spacing(1.5),
    },
}))

export const SmartPayContent = memo(() => {
    const t = useI18N()
    const { classes } = useStyles()

    const [addAnchorEl, setAddAnchorEl] = useState<HTMLElement | null>(null)
    const [manageAnchorEl, setManageAnchorEl] = useState<HTMLElement | null>(null)
    const [current, setCurrent] = useState<Wallet>()

    const wallets = useWallets()
    const contractAccounts = wallets.filter((x) => x.owner)

    // #region Remote Dialog Controller
    const { openDialog: openApproveMaskDialog } = useRemoteControlledDialog(PluginSmartPayMessages.approveDialogEvent)
    const { setDialog: setReceiveDialog } = useRemoteControlledDialog(PluginSmartPayMessages.receiveDialogEvent)
    const { openDialog: openSwapDialog } = useRemoteControlledDialog(CrossIsolationMessages.events.swapDialogEvent)
    // #endregion

    // #region web3 state

    const { openPopupWindow } = useSNSAdaptorContext()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const polygonDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)
    const maskAddress = Others?.getMaskTokenAddress(chainId)

    const { value: assets } = useFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, {
        chainId,
        account: current?.address,
    })

    const maskToken = assets?.find((x) => isSameAddress(maskAddress, x.address))

    const { EP_CONTRACT_ADDRESS } = useSmartPayConstants(chainId)
    const { value: allowance = '0' } = useERC20TokenAllowance(current?.address, EP_CONTRACT_ADDRESS, {
        chainId,
    })

    const availableBalanceTooLow = isLessThan(formatBalance(allowance, maskToken?.decimals), 0.1)

    const { value: maskBalance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, maskAddress, {
        account: current?.address,
    })

    const allAssets = useMemo(() => {
        if (!assets) return EMPTY_LIST

        const target = assets.filter((asset) => asset.chainId === chainId)
        if (target.length > 1) return target

        const maskAsset: Web3Helper.FungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM> | undefined =
            maskAddress && Others?.createFungibleToken && chainId
                ? {
                      ...Others.createFungibleToken(chainId, SchemaType.ERC20, maskAddress, 'Mask', 'Mask', 18),
                      balance: maskBalance ?? '0',
                  }
                : undefined
        return compact([...target, maskAsset])
    }, [assets, maskAddress, maskBalance, chainId])

    // #endregion

    // #region copy event handler
    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useSnackbarCallback({
        executor: async (address?: string) => copyToClipboard(address ?? ''),
        deps: [],
        successText: t.copy_wallet_address_success(),
    })
    // #endregion

    const [menu, openMenu] = useMenuConfig(
        contractAccounts?.map((account, index) => {
            return (
                <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    columnGap={1}
                    onClick={() => setCurrent(account)}
                    sx={{ cursor: 'pointer' }}>
                    <Box position="relative" width={30} height={30}>
                        <Icons.SmartPay size={30} />
                        <ImageIcon classes={{ icon: classes.badge }} size={12} icon={polygonDescriptor?.icon} />
                    </Box>
                    <Box display="flex" flexDirection="column" justifyContent="space-between" minWidth={150}>
                        <Typography fontSize={16} lineHeight="20px" fontWeight={700}>
                            {current?.name}
                        </Typography>
                        <Typography className={classes.address}>
                            {formatEthereumAddress(account?.address ?? '', 4)}
                            <Icons.PopupCopy
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onCopy(account.address)
                                }}
                                size={14}
                            />
                            <Link
                                href={
                                    chainId ? Others?.explorerResolver.addressLink(chainId, account.address) : undefined
                                }
                                target="_blank"
                                title="View on Explorer"
                                rel="noopener noreferrer"
                                className={classes.linkIcon}
                                onClick={(e) => e.stopPropagation()}>
                                <Icons.LinkOut size={14} />
                            </Link>
                        </Typography>
                    </Box>
                    <Radio checked={isSameAddress(current?.address, account.address)} />
                </Box>
            )
        }) ?? [],
        {
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'center',
            },
            MenuListProps: {
                className: classes.menu,
            },
        },
    )

    // #region event handler

    const connectToCurrent = useCallback(async () => {
        if (isSameAddress(current?.address, account)) return
        await connection?.connect({
            account: current?.address,
            chainId,
            owner: current?.owner,
            identifier: current?.identifier,
            providerType: ProviderType.MaskWallet,
        })
    }, [account, current, connection, chainId])
    const [{ loading: openLuckDropLoading }, handleLuckDropClick] = useAsyncFn(async () => {
        await connectToCurrent()
        CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
            reason: 'timeline',
            open: true,
            options: {
                startupPlugin: PluginID.RedPacket,
            },
        })
    }, [connectToCurrent])

    const [{ loading: openSwapLoading }, handleSwapClick] = useAsyncFn(async () => {
        await connectToCurrent()
        openSwapDialog()
    }, [connectToCurrent])

    const [{ loading: openSendLoading }, handleSendClick] = useAsyncFn(async () => {
        await connectToCurrent()
        await openPopupWindow(PopupRoutes.Transfer, { toBeClose: 1 })
    }, [connectToCurrent, openPopupWindow])

    const handleReceiveClick = useCallback(() => {
        setReceiveDialog({
            open: true,
            address: current?.address,
            name: current?.name,
        })
    }, [current])

    // #endregion

    useEffect(() => {
        if (!contractAccounts?.length) return

        setCurrent((prev) => {
            if (!prev) return first(contractAccounts)
            return prev
        })
    }, [contractAccounts])

    return (
        <>
            <DialogContent className={classes.dialogContent}>
                <Box className={classes.card}>
                    <Box display="flex" alignItems="center" columnGap={1.5}>
                        <Box position="relative" width={30} height={30}>
                            <Icons.SmartPay size={30} />
                            <ImageIcon classes={{ icon: classes.badge }} size={12} icon={polygonDescriptor?.icon} />
                        </Box>
                        <Box display="flex" flexDirection="column" justifyContent="space-between">
                            <Typography fontSize={16} lineHeight="20px" fontWeight={700} sx={{ display: 'flex' }}>
                                {current?.name} <Icons.ArrowDrop size={20} onClick={openMenu} />
                                {menu}
                            </Typography>
                            <Typography className={classes.address}>
                                {formatEthereumAddress(current?.address ?? '', 4)}
                                <Icons.PopupCopy onClick={() => onCopy(current?.address)} size={14} />
                                <Link
                                    href={
                                        current && chainId
                                            ? Others?.explorerResolver.addressLink(chainId, current.address)
                                            : ''
                                    }
                                    target="_blank"
                                    title="View on Explorer"
                                    rel="noopener noreferrer"
                                    className={classes.linkIcon}>
                                    <Icons.LinkOut size={14} />
                                </Link>
                            </Typography>
                        </Box>
                    </Box>

                    <Typography mt="14px" fontSize={36} fontWeight={700} lineHeight={1.2}>
                        $233.00
                    </Typography>
                    <Box display="flex" columnGap={1} position="absolute" top={16} right={16}>
                        <Icons.KeySquare onClick={(event) => setManageAnchorEl(event.currentTarget)} size={24} />
                        <Icons.Add onClick={(event) => setAddAnchorEl(event.currentTarget)} size={24} />
                        <AddSmartPayPopover
                            open={!!addAnchorEl}
                            anchorEl={addAnchorEl}
                            onClose={() => setAddAnchorEl(null)}
                        />
                        <AccountsManagerPopover
                            open={!!manageAnchorEl}
                            anchorEl={manageAnchorEl}
                            address={current?.address}
                            owner={current?.owner}
                            name={current?.name}
                            onClose={() => setManageAnchorEl(null)}
                        />
                    </Box>
                </Box>
                <List dense className={classes.list}>
                    {allAssets?.map((token, index) => (
                        <ListItem className={classes.listItem} key={index}>
                            <Box display="flex" alignItems="center" columnGap="10px">
                                <TokenIcon
                                    size={36}
                                    address={token.address}
                                    name={token.name}
                                    chainId={token.chainId}
                                    logoURL={token.logoURL}
                                />
                                <Box>
                                    <Typography fontSize={16} lineHeight="20px" fontWeight={700}>
                                        {token.symbol}
                                        {isSameAddress(token.address, maskAddress) ? (
                                            <ShadowRootTooltip
                                                title={
                                                    availableBalanceTooLow
                                                        ? t.allow_mask_as_gas_token_description()
                                                        : t.remain_mask_tips({
                                                              balance: formatBalance(allowance, maskToken?.decimals),
                                                              symbol: maskToken?.symbol ?? '',
                                                          })
                                                }
                                                placement="top">
                                                <Typography
                                                    ml={1}
                                                    onClick={openApproveMaskDialog}
                                                    component="span"
                                                    className={classes.maskGasTip}
                                                    display="inline-flex"
                                                    alignItems="center">
                                                    {availableBalanceTooLow ? (
                                                        <>
                                                            (<Icons.GasStation size={18} />{' '}
                                                            {t.allow_mask_as_gas_token()})
                                                        </>
                                                    ) : (
                                                        <Icons.GasStation size={18} />
                                                    )}
                                                </Typography>
                                            </ShadowRootTooltip>
                                        ) : null}
                                    </Typography>
                                    <Typography className={classes.name}>
                                        {token.name}
                                        <Link
                                            href={
                                                chainId
                                                    ? Others?.explorerResolver.addressLink(chainId, token.address)
                                                    : undefined
                                            }
                                            target="_blank"
                                            title="View on Explorer"
                                            rel="noopener noreferrer"
                                            className={classes.linkIcon}>
                                            <Icons.LinkOut size={14} />
                                        </Link>
                                    </Typography>
                                </Box>
                            </Box>
                            <ListItemText className={classes.balance}>
                                <FormattedBalance
                                    value={isNaN(token.balance) ? 0 : token.balance}
                                    decimals={isNaN(token.decimals) ? 0 : token.decimals}
                                    significant={6}
                                    formatter={formatBalance}
                                />
                            </ListItemText>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                <ActionButton
                    loading={openLuckDropLoading}
                    variant="roundedContained"
                    startIcon={<Icons.RedPacket />}
                    fullWidth
                    size="small"
                    onClick={handleLuckDropClick}>
                    {t.lucky_drop()}
                </ActionButton>
                <ActionButton
                    loading={openSwapLoading}
                    variant="roundedContained"
                    startIcon={<Icons.SwapColorful />}
                    fullWidth
                    size="small"
                    onClick={handleSwapClick}>
                    {t.swap()}
                </ActionButton>
                <ActionButton
                    loading={openSendLoading}
                    variant="roundedContained"
                    startIcon={<Icons.SendColorful />}
                    fullWidth
                    size="small"
                    onClick={handleSendClick}>
                    {t.send()}
                </ActionButton>
                <Button
                    variant="roundedContained"
                    startIcon={<Icons.ReceiveColorful />}
                    fullWidth
                    size="small"
                    onClick={handleReceiveClick}>
                    {t.receive()}
                </Button>
            </DialogActions>
        </>
    )
})
