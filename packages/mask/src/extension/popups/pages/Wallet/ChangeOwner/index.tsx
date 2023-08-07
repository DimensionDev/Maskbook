import urlcat from 'urlcat'
import { Contract, ExplorerResolver, Web3 } from '@masknet/web3-providers'
import { useMemo, useState } from 'react'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAsync, useAsyncFn } from 'react-use'
import { useContainer } from 'unstated-next'
import { Box, Link, Popover, Typography, alpha } from '@mui/material'
import { Icons } from '@masknet/icons'
import { CopyButton } from '@masknet/shared'
import { ECKeyIdentifier, type NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { ChainContextProvider, useChainContext, useWallet, useWallets } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ProviderType, type GasConfig } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../../utils/index.js'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { StyledRadio } from '../../../components/StyledRadio/index.js'
import { PopupContext } from '../../../hook/usePopupContext.js'
import { useTitle } from '../../../hook/useTitle.js'
import { PersonaAvatar } from '../../../components/PersonaAvatar/index.js'
import { GasSettingMenu } from '../../../components/GasSettingMenu/index.js'
import { WalletContext } from '../hooks/useWalletContext.js'
import type { AbiItem } from 'web3-utils'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2),
    },
    title: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '16px',
        color: theme.palette.maskColor.main,
    },
    list: {
        padding: 0,
        height: 212,
        overflow: 'auto',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    primaryItem: {
        margin: 0,
        cursor: 'default',
        background:
            theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.90) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.20) 1.03%, rgba(98, 152, 234, 0.20) 1.04%, rgba(98, 126, 234, 0.20) 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.00) 100%)',
    },
    secondItem: {
        margin: 0,
        cursor: 'default',
        background: theme.palette.maskColor.bottom,
        border: `1px solid ${theme.palette.maskColor.line}`,
    },
    primaryItemText: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    primaryItemSecondText: {
        display: 'flex',
        fontSize: 10,
        fontWeight: 400,
        color: theme.palette.maskColor.secondaryMain,
    },
    walletAddress: {
        transform: 'translateY(3px)',
        marginRight: 4,
    },
    walletInfo: {
        marginLeft: 12,
        height: 38,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    item: {
        display: 'flex',
        padding: theme.spacing(1.5),
        alignItems: 'center',
        cursor: 'pointer',
        justifyContent: 'space-between',
        background: theme.palette.maskColor.bottom,
        borderRadius: 16,
        '&:hover': {
            background: theme.palette.maskColor.bg,
        },
    },
    primaryItemBox: {
        display: 'flex',
        alignItems: 'center',
        height: 36,
    },

    paper: {
        padding: theme.spacing(1.5),
        borderRadius: 16,
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    popoverTitle: {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        display: 'flex',
        justifyContent: 'space-between',
    },
    identity: {
        fontSIze: 14,
        lineHeight: '18px',
        color: '#767F8D',
        display: 'flex',
        alignItems: 'center',
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    secondaryButton: {
        backgroundColor: '#F7F9FA',
        color: '#1C68F3',
        '&:hover': {
            backgroundColor: 'rgba(28, 104, 243, 0.04)',
        },
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: 16,
        position: 'fixed',
        bottom: 0,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    disabledItem: {
        opacity: 0.5,
    },
    linkIcon: {
        color: theme.palette.maskColor.main,
        cursor: 'pointer',
        width: 16,
        height: 16,
        marginRight: 4,
    },
    avatar: {
        borderRadius: '50%',
        height: 24,
        width: 24,
        background: alpha(theme.palette.maskColor.primary, 0.2),
    },
    input: {
        fontSize: 13,
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: theme.palette.maskColor.second,
        fontWeight: 700,
    },
}))

enum ManagerAccountType {
    Wallet = 'Wallet',
    Persona = 'Persona',
}

interface ManagerAccount {
    type: ManagerAccountType
    name?: string
    address?: string
    identifier?: ECKeyIdentifier
}

const FALLBACK_GAS = 50000

export default function ChangeOwner() {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const location = useLocation()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [manageAccount, setManageAccount] = useState<ManagerAccount>()

    const { smartPayChainId } = useContainer(PopupContext)
    const { personaManagers } = useContainer(WalletContext)
    const chainContextValue = useMemo(() => ({ chainId: smartPayChainId }), [smartPayChainId])
    const [paymentToken, setPaymentToken] = useState('')
    const [gasConfig, setGasConfig] = useState<GasConfig>()
    const wallet = useWallet()
    const wallets = useWallets()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const walletManagers = useMemo(() => wallets.filter((x) => !x.owner), [wallets])

    const walletManager = useMemo(
        () => wallets.find((x) => !x.owner && isSameAddress(wallet?.owner, x.address)),
        [walletManagers, wallet],
    )
    const personaManager = useMemo(
        () => personaManagers?.find((x) => isSameAddress(wallet?.owner, x.address)),
        [personaManagers, wallet],
    )

    const managerAddress = walletManager?.address ?? personaManager?.address

    const { value: gas } = useAsync(async () => {
        const contract = Contract.getWeb3Contract<Wallet>(wallet?.address, WalletABI as AbiItem[])
        if (!manageAccount?.address) return
        const tx = {
            from: wallet?.address,
            to: wallet?.address,
            data: contract?.methods.changeOwner(manageAccount.address).encodeABI(),
        }
        const gas = await Web3.estimateTransaction?.(tx, FALLBACK_GAS)
        return gas ? Number.parseInt(gas, 16).toString() : FALLBACK_GAS.toString()
    }, [manageAccount?.address, wallet?.address])

    const [{ loading: loadingHandleConfirm }, handleConfirm] = useAsyncFn(async () => {
        if (!manageAccount?.address || !wallet) return

        const hash = await Web3.changeOwner?.(manageAccount.address, {
            chainId: smartPayChainId,
            account: wallet?.address,
            providerType: ProviderType.MaskWallet,
            owner: wallet?.owner,
            identifier: ECKeyIdentifier.from(wallet?.identifier).unwrapOr(undefined),
            overrides: gasConfig,
        })

        if (!hash) return

        const receipt = await Web3.confirmTransaction(hash, {
            signal: AbortSignal.timeout(5 * 60 * 1000),
        })

        if (!receipt.status) return

        await Web3.updateWallet?.(
            wallet.address,
            {
                owner: manageAccount.address,
                identifier: manageAccount.identifier?.toText(),
            },
            { providerType: ProviderType.MaskWallet },
        )
    }, [manageAccount, smartPayChainId, wallet, gasConfig])

    useTitle(t('popups_wallet_change_owner'))

    return (
        <>
            <div className={classes.content}>
                <Box className={cx(classes.item, classes.primaryItem)}>
                    <Box className={classes.primaryItemBox}>
                        <Icons.SmartPay size={24} />
                        <div className={classes.walletInfo}>
                            <Typography className={classes.primaryItemText}>{wallet?.name}</Typography>
                            <Typography className={classes.primaryItemSecondText}>
                                <span className={classes.walletAddress}>{wallet?.address}</span>
                                {wallet?.address ? (
                                    <>
                                        <CopyButton size={16} className={classes.linkIcon} text={wallet.address} />
                                        <Link
                                            href={ExplorerResolver.addressLink(chainId, wallet.address)}
                                            target="_blank"
                                            title="View on Explorer"
                                            rel="noopener noreferrer"
                                            onClick={(event) => {
                                                event.stopPropagation()
                                            }}
                                            className={classes.linkIcon}>
                                            <Icons.LinkOut size={16} className={classes.linkIcon} />
                                        </Link>
                                    </>
                                ) : null}
                            </Typography>
                        </div>
                    </Box>
                </Box>
                <Typography className={classes.title} sx={{ mb: 2, mt: 2 }}>
                    {t('popups_wallet_settings_current_management_account')}
                </Typography>
                <Box className={cx(classes.item, classes.secondItem)}>
                    <Box className={classes.primaryItemBox}>
                        {walletManager ? (
                            <Icons.ETH size={24} />
                        ) : personaManager ? (
                            <div className={classes.avatar}>
                                <PersonaAvatar avatar={personaManager.avatar} size={24} />
                            </div>
                        ) : null}
                        <div className={classes.walletInfo}>
                            <Typography className={classes.primaryItemText}>
                                {walletManager?.name ?? personaManager?.nickname}
                            </Typography>
                            <Typography className={classes.primaryItemSecondText}>
                                <span className={classes.walletAddress}>{managerAddress}</span>
                                {managerAddress ? (
                                    <>
                                        <CopyButton size={16} className={classes.linkIcon} text={managerAddress} />
                                        <Link
                                            href={
                                                walletManager
                                                    ? ExplorerResolver.addressLink(chainId, managerAddress)
                                                    : urlcat('https://web3.bio/', { s: managerAddress })
                                            }
                                            target="_blank"
                                            title="View on Explorer"
                                            rel="noopener noreferrer"
                                            onClick={(event) => {
                                                event.stopPropagation()
                                            }}
                                            className={classes.linkIcon}>
                                            <Icons.LinkOut size={16} className={classes.linkIcon} />
                                        </Link>
                                    </>
                                ) : null}
                            </Typography>
                        </div>
                    </Box>
                </Box>
                <Typography className={classes.title} sx={{ mb: 2, mt: 2 }}>
                    {t('popups_wallet_set_a_new_manage_account')}
                </Typography>
                <StyledInput
                    placeholder={t('popups_wallet_settings_local_persona_or_wallet_only')}
                    InputProps={{
                        endAdornment: <Icons.ArrowDownRound size={18} sx={{ cursor: 'pointer' }} />,
                        classes: { input: classes.input },
                    }}
                    value={manageAccount?.address}
                    onMouseDown={(event) => {
                        setAnchorEl(event.currentTarget)
                    }}
                    inputProps={{ style: { cursor: 'pointer' } }}
                />
                {manageAccount ? (
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Typography className={classes.label}>{t('gas_fee')}</Typography>
                        <ChainContextProvider value={chainContextValue}>
                            <GasSettingMenu
                                minimumGas={gas ?? FALLBACK_GAS.toString()}
                                initConfig={gasConfig}
                                paymentToken={paymentToken}
                                defaultChainId={chainId}
                                owner={wallet?.owner}
                                onChange={setGasConfig}
                                onPaymentTokenChange={(paymentToken) => setPaymentToken(paymentToken)}
                                allowMaskAsGas
                            />
                        </ChainContextProvider>
                    </Box>
                ) : null}
                <Popover
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    onClose={() => {
                        setAnchorEl(null)
                    }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    PaperProps={{
                        style: { minWidth: `${anchorEl?.clientWidth ?? 568}px`, height: 212 },
                        className: classes.paper,
                    }}
                    disableRestoreFocus>
                    <Box className={classes.list}>
                        {personaManagers?.map((persona) => (
                            <Box
                                key={persona.address}
                                className={cx(
                                    classes.item,
                                    isSameAddress(persona.address, wallet?.owner) ? classes.disabledItem : undefined,
                                )}
                                onClick={() => {
                                    if (isSameAddress(persona.address, wallet?.owner)) return
                                    setManageAccount({
                                        type: ManagerAccountType.Persona,
                                        name: persona.nickname,
                                        address: persona.address,
                                        identifier: persona.identifier,
                                    })
                                    setAnchorEl(null)
                                }}>
                                <Box display="flex" alignItems="center" columnGap={0.5}>
                                    <div className={classes.avatar}>
                                        <PersonaAvatar avatar={persona.avatar} size={24} />
                                    </div>

                                    <Box ml="6px">
                                        <Typography className={classes.popoverTitle}>{persona.nickname}</Typography>
                                        <Typography className={classes.identity}>
                                            {persona.address ? formatEthereumAddress(persona.address, 4) : null}
                                        </Typography>
                                    </Box>
                                </Box>
                                <StyledRadio checked={isSameAddress(persona.address, manageAccount?.address)} />
                            </Box>
                        ))}
                        {walletManagers?.map((wallet) => (
                            <Box
                                key={wallet.address}
                                className={cx(
                                    classes.item,
                                    isSameAddress(wallet.address, wallet?.owner) ? classes.disabledItem : undefined,
                                )}
                                onClick={() => {
                                    if (isSameAddress(wallet.address, wallet?.owner)) return
                                    setManageAccount({
                                        type: ManagerAccountType.Wallet,
                                        name: wallet.name,
                                        address: wallet.address,
                                    })
                                    setAnchorEl(null)
                                }}>
                                <Box display="flex" alignItems="center" columnGap={0.5}>
                                    <Icons.MaskBlue size={24} />
                                    <Box ml="6px">
                                        <Typography className={classes.popoverTitle}>{wallet.name}</Typography>
                                        <Typography className={classes.identity}>
                                            {formatEthereumAddress(wallet.address, 4)}
                                        </Typography>
                                    </Box>
                                </Box>
                                <StyledRadio checked={isSameAddress(manageAccount?.address, wallet.address)} />
                            </Box>
                        ))}
                    </Box>
                </Popover>
            </div>
            <div className={classes.controller}>
                <ActionButton
                    variant="contained"
                    className={cx(classes.button, classes.secondaryButton)}
                    onClick={() => navigate(-1)}>
                    {t('cancel')}
                </ActionButton>
                <ActionButton
                    variant="contained"
                    className={classes.button}
                    onClick={handleConfirm}
                    loading={loadingHandleConfirm}
                    disabled={loadingHandleConfirm}>
                    {t('wallet_status_button_change')}
                </ActionButton>
            </div>
        </>
    )
}
