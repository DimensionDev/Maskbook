import { ImageIcon, ReversedAddress, useSnackbarCallback } from '@masknet/shared'
import { makeStyles, MaskColorVar, ShadowRootMenu, ShadowRootTooltip, useStylesExtends } from '@masknet/theme'
import { formatEthereumAddress, isSameAddress, useChainId } from '@masknet/web3-shared-evm'
import { Button, Divider, IconProps, Link, ListItemIcon, MenuItem, Stack, Typography, useTheme } from '@mui/material'
import { memo, useCallback, useEffect, useState } from 'react'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { WalletSettingIcon } from '../assets/setting'
import { CheckedIcon, UncheckIcon } from '../assets/checked'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'
import { NFTWalletConnect } from './WalletConnect'
import { BindingProof, PopupRoutes } from '@masknet/shared-base'
import {
    NetworkPluginID,
    useCurrentWeb3NetworkPluginID,
    useNetworkDescriptor,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { Services } from '../../../extension/service'
import { useI18N } from '../locales/i18n_generated'
import { useCopyToClipboard } from 'react-use'
import { LinkIcon } from '../assets/link'
import { CopyIcon } from '../assets/copy'
import classNames from 'classnames'
import { VerifyIcon } from '../assets/verify'
import { noop } from 'lodash-unified'
import { Verify2Icon } from '../assets/verify2'

const useStyles = makeStyles()((theme) => ({
    root: {
        borderRadius: 9999,
        paddingLeft: 4,
        paddingRight: 4,
        cursor: 'pointer',
        backgroundColor: theme.palette.mode === 'dark' ? '#15171A' : '#F6F8F8',
    },
    wrapper: {},
    address: {},
    copy: {
        color: theme.palette.secondary.main,
    },

    icon: {
        width: 24,
        height: 24,
    },
    iconShadow: {
        filter: 'drop-shadow(0px 0px 6px rgba(28, 104, 243, 0.6))',
    },
    change: {
        marginLeft: theme.spacing(4),
        backgroundColor: MaskColorVar.twitterButton,
        borderRadius: 9999,
        fontWeight: 600,
        fontSize: 14,
    },
}))

interface AddressNamesProps extends withClasses<'root'> {
    onChange: (address: string) => void
    account: string
    wallets: BindingProof[]
}

export function AddressNames(props: AddressNamesProps) {
    const { onChange, account, wallets } = props
    const classes = useStylesExtends(useStyles(), props)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const onClose = () => setAnchorEl(null)
    const onOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
    const t = useI18N()
    const currentPluginId = useCurrentWeb3NetworkPluginID()

    const [selectedWallet, setSelectedWallet] = useState(account || wallets?.[0]?.identity || '')
    const onClick = useCallback((address: string) => {
        onChange(address)
        setSelectedWallet(address)
        onClose()
    }, [])

    useEffect(() => {
        if (!account && !wallets?.[0]?.identity) return
        setSelectedWallet(account || wallets?.[0]?.identity)
    }, [account, wallets?.[0]?.identity])

    const { setDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const chainId = useChainId()
    const openPopupsWindow = useCallback(() => {
        Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
            chainId,
            internal: true,
        })
    }, [chainId])

    const onConnectWallet = useCallback(() => {
        openSelectProviderDialog({ open: true, pluginID: NetworkPluginID.PLUGIN_EVM })
        onClose()
    }, [openSelectProviderDialog, onClose])

    const walletItem = (
        selectedWallet: string,
        wallet: string,
        enableChange: boolean,
        onClick: (wallet: string) => void,
        onChange?: () => void,
        verify?: boolean,
        isETH?: boolean,
    ) => (
        <MenuItem key={wallet} value={wallet} onClick={() => onClick(account)}>
            <ListItemIcon>
                {selectedWallet === wallet ? (
                    <>
                        <CheckedIcon className={classNames(classes.icon, classes.iconShadow)} />
                    </>
                ) : (
                    <UncheckIcon className={classes.icon} />
                )}
            </ListItemIcon>
            <WalletUI address={wallet} verify={verify} isETH={isETH} />
            {enableChange && (
                <Button size="small" className={classes.change} onClick={onChange}>
                    {t.change()}
                </Button>
            )}
        </MenuItem>
    )

    if (!wallets.length && (currentPluginId !== NetworkPluginID.PLUGIN_EVM || !account)) return <NFTWalletConnect />

    return (
        <Stack className={classes.root}>
            <Stack
                onClick={onOpen}
                direction="row"
                alignItems="center"
                justifyContent="center"
                className={classes.wrapper}>
                <WalletUI address={selectedWallet} isETH />
                <ArrowDropDownIcon />
            </Stack>
            <ShadowRootMenu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose} disableRestoreFocus>
                {account ? (
                    walletItem(
                        selectedWallet,
                        account,
                        Boolean(account),
                        () => onClick(account),
                        onConnectWallet,
                        false,
                        true,
                    )
                ) : (
                    <MenuItem key="connect">
                        <Button
                            fullWidth
                            onClick={onConnectWallet}
                            sx={{ width: 311, padding: 1.5, borderRadius: 9999 }}>
                            {t.connect_your_wallet()}
                        </Button>
                    </MenuItem>
                )}
                {wallets
                    .sort((a, b) => Number(b.created_at) - Number(a.created_at))
                    ?.filter((x) => !isSameAddress(x.identity, account))
                    .map((x) =>
                        walletItem(
                            selectedWallet,
                            x.identity,
                            false,
                            () => onClick(x.identity),
                            () => noop,
                            true,
                            true,
                        ),
                    )}
                <Divider />

                <MenuItem
                    key="settings"
                    onClick={() => {
                        openPopupsWindow()
                        onClose()
                    }}>
                    <ListItemIcon>
                        <WalletSettingIcon className={classes.icon} />
                    </ListItemIcon>
                    <Typography fontSize={14} fontWeight={700}>
                        {t.wallet_settings()}
                    </Typography>
                    <Verify2Icon style={{ marginLeft: 24 }} />
                </MenuItem>
            </ShadowRootMenu>
        </Stack>
    )
}

const useWalletUIStyles = makeStyles()((theme) => ({
    root: {},
    address: {
        fontSize: 10,
    },
    copy: {
        fontSize: 16,
        cursor: 'pointer',
    },
    link: {
        color: theme.palette.text.secondary,
        lineHeight: 0,
    },
    linkIcon: {
        width: 16,
        height: 16,
    },
}))

interface WalletUIProps {
    address: string
    verify?: boolean
    isETH?: boolean
}

function WalletUI(props: WalletUIProps) {
    const { Utils } = useWeb3State()
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const { isETH, address, verify = false } = props
    const networkDescriptor = useNetworkDescriptor(undefined, isETH ? NetworkPluginID.PLUGIN_EVM : undefined)
    const { classes } = useWalletUIStyles()

    if (!address) return null
    return (
        <Stack direction="row" alignItems="center" justifyContent="center">
            <ImageIcon size={30} icon={networkDescriptor?.icon} />
            <Stack direction="column" sx={{ marginLeft: 0.5 }}>
                <Stack display="flex" fontSize={14} flexDirection="row" alignItems="center">
                    <ReversedAddress address={address} pluginId={NetworkPluginID.PLUGIN_EVM} />
                    {verify ? <VerifyIcon style={{ width: 13, height: 13, marginLeft: 4 }} /> : null}
                </Stack>
                <Stack direction="row" alignItems="center">
                    <Typography variant="body2" color="textSecondary" className={classes.address}>
                        {formatEthereumAddress(address, 4)}
                    </Typography>
                    <CopyIconButton text={address} className={classes.copy} />
                    <Link
                        className={classes.link}
                        href={Utils?.resolveAddressLink?.(1, address) ?? ''}
                        target="_blank"
                        title="View on Explorer"
                        rel="noopener noreferrer">
                        <LinkIcon className={classes.linkIcon} />
                    </Link>
                </Stack>
            </Stack>
        </Stack>
    )
}

interface CopyIconButtonProps extends IconProps {
    text: string
}
const CopyIconButton = memo<CopyIconButtonProps>(({ text, ...props }) => {
    const t = useI18N()
    const theme = useTheme()
    const [, copyToClipboard] = useCopyToClipboard()
    const [open, setOpen] = useState(false)

    const onCopy = useSnackbarCallback({
        executor: async () => copyToClipboard(text),
        deps: [],
        successText: t.copy_success_of_wallet_address(),
    })

    return (
        <ShadowRootTooltip
            title={<span style={{ color: theme.palette.text.primary }}>{t.copied()}</span>}
            open={open}
            onMouseLeave={() => setOpen(false)}
            disableFocusListener
            disableTouchListener>
            <CopyIcon onClick={onCopy} className={props.className} />
        </ShadowRootTooltip>
    )
})
