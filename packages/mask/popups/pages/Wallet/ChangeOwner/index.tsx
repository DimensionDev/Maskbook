import urlcat from 'urlcat'
import { useMemo, useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { useNavigate } from 'react-router-dom'
import type { AbiItem } from 'web3-utils'
import { useContainer } from '@masknet/shared-base-ui'
import { EVMContract, EVMExplorerResolver, EVMWeb3 } from '@masknet/web3-providers'
import WalletABI from '@masknet/web3-contracts/abis/Wallet.json'
import type { Wallet } from '@masknet/web3-contracts/types/Wallet.js'
import { Box, Link, Popover, Typography, alpha } from '@mui/material'
import { Icons } from '@masknet/icons'
import { CopyButton } from '@masknet/shared'
import { ECKeyIdentifier, type NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { ChainContextProvider, useChainContext, useWallet, useWallets } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ProviderType, type GasConfig } from '@masknet/web3-shared-evm'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { StyledRadio } from '../../../components/StyledRadio/index.js'
import { PopupContext, useTitle } from '../../../hooks/index.js'
import { PersonaAvatar } from '../../../components/PersonaAvatar/index.js'
import { GasSettingMenu } from '../../../components/GasSettingMenu/index.js'
import { useQuery } from '@tanstack/react-query'
import Services from '#services'
import { BottomController } from '../../../components/BottomController/index.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
        maxHeight: 212,
        overflow: 'auto',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    primaryItem: {
        margin: 0,
        cursor: 'default',
        borderRadius: 8,
        background:
            theme.palette.mode === 'light' ?
                'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.90) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.20) 1.03%, rgba(98, 152, 234, 0.20) 1.04%, rgba(98, 126, 234, 0.20) 100%)'
            :   'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.00) 100%)',
    },
    secondItem: {
        margin: 0,
        borderRadius: 8,
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
        fontSize: 12,
        fontWeight: 400,
        color: theme.palette.maskColor.second,
        WebkitTextSizeAdjust: '100%',
    },
    walletAddress: {
        marginRight: 4,
        transform: 'scale(0.8333)',
        transformOrigin: 'left',
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
        background: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 4px 30px 0px rgba(255, 255, 255, 0.15)'
            :   '0px 4px 30px 0px rgba(0, 0, 0, 0.10)',
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
        fontSize: 14,
        lineHeight: '20px',
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

export { ChangeOwner as Component }
export function ChangeOwner() {
    const { _ } = useLingui()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [manageAccount, setManageAccount] = useState<ManagerAccount>()

    const { smartPayChainId } = useContainer(PopupContext)
    const { data: personaManagers } = useQuery({
        queryKey: ['persona-managers'],
        queryFn: () => Services.Identity.queryOwnedPersonaInformation(true),
        networkMode: 'always',
    })
    const [paymentToken, setPaymentToken] = useState('')
    const [gasConfig, setGasConfig] = useState<GasConfig>()
    const wallet = useWallet()
    const wallets = useWallets()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const walletManagers = useMemo(() => wallets.filter((x) => !x.owner), [wallets])

    const walletManager = useMemo(
        () => walletManagers.find((x) => !x.owner && isSameAddress(wallet?.owner, x.address)),
        [walletManagers, wallet],
    )
    const personaManager = useMemo(
        () => personaManagers?.find((x) => isSameAddress(wallet?.owner, x.address)),
        [personaManagers, wallet?.owner],
    )

    const managerAddress = walletManager?.address ?? personaManager?.address

    const { value: gas } = useAsync(async () => {
        const contract = EVMContract.getWeb3Contract<Wallet>(wallet?.address, WalletABI as AbiItem[])
        if (!manageAccount?.address || !wallet?.address) return
        const tx = {
            from: wallet.address,
            to: wallet.address,
            data: contract?.methods.changeOwner(manageAccount.address).encodeABI(),
        }
        const gas = await EVMWeb3.estimateTransaction(tx, FALLBACK_GAS)
        return gas ? Number.parseInt(gas, 16).toString() : FALLBACK_GAS.toString()
    }, [manageAccount?.address, wallet?.address])

    const [{ loading: loadingHandleConfirm }, handleConfirm] = useAsyncFn(async () => {
        if (!manageAccount?.address || !wallet) return

        const hash = await EVMWeb3.changeOwner(manageAccount.address, {
            chainId: smartPayChainId,
            account: wallet.address,
            providerType: ProviderType.MaskWallet,
            owner: wallet.owner,
            identifier: ECKeyIdentifier.from(wallet.identifier).unwrapOr(undefined),
            gasOptionType: gasConfig?.gasOptionType,
            overrides: gasConfig,
        })

        if (!hash) return

        const receipt = await EVMWeb3.confirmTransaction(hash, {
            signal: AbortSignal.timeout(5 * 60 * 1000),
        })

        if (!receipt.status) return

        await EVMWeb3.updateWallet(
            wallet.address,
            {
                owner: manageAccount.address,
                identifier: manageAccount.identifier?.toText(),
            },
            { providerType: ProviderType.MaskWallet },
        )
    }, [manageAccount, smartPayChainId, wallet, gasConfig])
    const disabled = !manageAccount?.address || !wallet || loadingHandleConfirm

    useTitle(_(msg`Change Owner`))

    return (
        <>
            <div className={classes.content}>
                <Box className={cx(classes.item, classes.primaryItem)}>
                    <Box className={classes.primaryItemBox}>
                        <Icons.SmartPay size={24} />
                        <div className={classes.walletInfo}>
                            <Typography className={classes.primaryItemText}>{wallet?.name}</Typography>
                            <Typography className={classes.primaryItemSecondText}>
                                <span className={classes.walletAddress} style={{ width: 264 }}>
                                    {wallet?.address}
                                </span>
                                {wallet?.address ?
                                    <>
                                        <CopyButton size={16} className={classes.linkIcon} text={wallet.address} />
                                        <Link
                                            href={EVMExplorerResolver.addressLink(chainId, wallet.address)}
                                            target="_blank"
                                            title={_(msg`View on Explorer`)}
                                            rel="noopener noreferrer"
                                            onClick={(event) => {
                                                event.stopPropagation()
                                            }}
                                            className={classes.linkIcon}>
                                            <Icons.LinkOut size={16} className={classes.linkIcon} />
                                        </Link>
                                    </>
                                :   null}
                            </Typography>
                        </div>
                    </Box>
                </Box>
                <Typography className={classes.title} sx={{ mb: 2, mt: 2 }}>
                    <Trans>Current Management Account</Trans>
                </Typography>
                <Box className={cx(classes.item, classes.secondItem)}>
                    <Box className={classes.primaryItemBox}>
                        {walletManager ?
                            <Icons.ETH size={24} />
                        : personaManager ?
                            <div className={classes.avatar}>
                                <PersonaAvatar
                                    avatar={personaManager.avatar}
                                    pubkey={personaManager.identifier.publicKeyAsHex}
                                    size={24}
                                />
                            </div>
                        :   null}
                        <div className={classes.walletInfo}>
                            <Typography className={classes.primaryItemText}>
                                {walletManager?.name ?? personaManager?.nickname}
                            </Typography>
                            <Typography className={classes.primaryItemSecondText}>
                                <span className={classes.walletAddress} style={{ width: 264 }}>
                                    {managerAddress}
                                </span>
                                {managerAddress ?
                                    <>
                                        <CopyButton size={16} className={classes.linkIcon} text={managerAddress} />
                                        <Link
                                            href={
                                                walletManager ?
                                                    EVMExplorerResolver.addressLink(chainId, managerAddress)
                                                :   urlcat('https://web3.bio/', { s: managerAddress })
                                            }
                                            target="_blank"
                                            title={_(msg`View on Explorer`)}
                                            rel="noopener noreferrer"
                                            onClick={(event) => {
                                                event.stopPropagation()
                                            }}
                                            className={classes.linkIcon}>
                                            <Icons.LinkOut size={16} className={classes.linkIcon} />
                                        </Link>
                                    </>
                                :   null}
                            </Typography>
                        </div>
                    </Box>
                </Box>
                <Typography className={classes.title} sx={{ mb: 2, mt: 2 }}>
                    <Trans>Set a New Management Account</Trans>
                </Typography>
                <StyledInput
                    placeholder={_(msg`Local persona or wallet only`)}
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
                {manageAccount ?
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Typography className={classes.label}>
                            <Trans>Gas Fee</Trans>
                        </Typography>
                        <ChainContextProvider chainId={smartPayChainId}>
                            <GasSettingMenu
                                defaultGasLimit={gas}
                                defaultGasConfig={gasConfig}
                                paymentToken={paymentToken}
                                defaultChainId={chainId}
                                owner={wallet?.owner}
                                onChange={setGasConfig}
                                onPaymentTokenChange={(paymentToken) => setPaymentToken(paymentToken)}
                                allowMaskAsGas
                            />
                        </ChainContextProvider>
                    </Box>
                :   null}
                <Popover
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    onClose={() => {
                        setAnchorEl(null)
                    }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    PaperProps={{
                        style: { minWidth: `${anchorEl?.clientWidth ?? 568}px`, maxHeight: 212 },
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
                                        <PersonaAvatar
                                            avatar={persona.avatar}
                                            pubkey={persona.identifier.publicKeyAsHex}
                                            size={24}
                                        />
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
                        {walletManagers.map((wallet) => (
                            <Box
                                key={wallet.address}
                                className={cx(
                                    classes.item,
                                    isSameAddress(wallet.address, wallet.owner) ? classes.disabledItem : undefined,
                                )}
                                onClick={() => {
                                    if (isSameAddress(wallet.address, wallet.owner)) return
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
            <BottomController>
                <ActionButton
                    fullWidth
                    className={classes.button}
                    variant="outlined"
                    color="secondary"
                    disabled={disabled}
                    onClick={async () => {
                        navigate(-1)
                        await Services.Helper.removePopupWindow()
                    }}>
                    <Trans>Cancel</Trans>
                </ActionButton>
                <ActionButton
                    fullWidth
                    variant="contained"
                    className={classes.button}
                    onClick={handleConfirm}
                    loading={loadingHandleConfirm}
                    disabled={disabled}>
                    <Trans>Change</Trans>
                </ActionButton>
            </BottomController>
        </>
    )
}
