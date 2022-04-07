import { useAccount, useNetworkDescriptor, useWeb3State } from '@masknet/plugin-infra'
import { ImageIcon, ReversedAddress } from '@masknet/shared'
import { NextIDPlatform } from '@masknet/shared-base'
import { makeStyles, ShadowRootMenu, useStylesExtends } from '@masknet/theme'
import { formatEthereumAddress, isSameAddress } from '@masknet/web3-shared-evm'
import { Button, CircularProgress, Divider, Link, ListItemIcon, MenuItem, Stack, Typography } from '@mui/material'
import { first } from 'lodash-unified'
import { useCallback, useState } from 'react'
import { ExternalLink } from 'react-feather'
import { CopyIconButton } from '../../NextID/components/CopyIconButton'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { WalletSettingIcon } from '../assets/setting'
import { usePersonas } from '../hooks/usePersonas'
import { CheckedIcon, UncheckIcon } from '../assets/checked'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'

const useStyles = makeStyles()(() => ({
    root: {},
    wrapper: {
        backgroundColor: '#F6F8F8',
        borderRadius: 9999,
        paddingLeft: 8,
        paddingRight: 8,
        cursor: 'pointer',
    },
    address: {},
    copy: {},
    link: {},
    linkIcon: {},
}))

interface AddressNamesProps extends withClasses<'root'> {
    onChange: (address: string) => void
}

export function AddressNames(props: AddressNamesProps) {
    const { onChange } = props
    const { Utils } = useWeb3State() ?? {}
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const { binds, isOwner, loading } = usePersonas()

    const wallets = binds?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum)
    const wallet = first(wallets)

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const onClose = () => setAnchorEl(null)
    const onOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)

    const [selectedWallet, setSelectedWallet] = useState(account)
    const onClick = useCallback((address: string) => {
        console.log(address)
        onChange(address)
        setSelectedWallet(address)
        onClose()
    }, [])

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    if (loading) {
        return (
            <div className={classes.root}>
                <CircularProgress size="small" />
            </div>
        )
    }

    if (!account && (!wallets?.length || !wallet)) return null

    return (
        <Stack className={classes.root}>
            <Stack
                onClick={onOpen}
                direction="row"
                alignItems="center"
                justifyContent="center"
                className={classes.wrapper}>
                <WalletUI address={selectedWallet} />
                <ArrowDropDownIcon />
            </Stack>
            <ShadowRootMenu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose} disableRestoreFocus>
                <MenuItem key={account} value={account} onClick={() => onClick(account)}>
                    <ListItemIcon>
                        {selectedWallet === account ? (
                            <CheckedIcon style={{ width: 38, height: 38 }} />
                        ) : (
                            <UncheckIcon />
                        )}
                    </ListItemIcon>
                    <WalletUI address={account} />
                    {account && (
                        <Button style={{ marginLeft: 16 }} onClick={openSelectProviderDialog}>
                            Change
                        </Button>
                    )}
                </MenuItem>
                {wallets
                    ?.filter((x) => !isSameAddress(x.identity, account))
                    .map((x) => (
                        <MenuItem key={x.identity} value={x.identity} onClick={() => onClick(x.identity)}>
                            <ListItemIcon>
                                {selectedWallet === x.identity ? (
                                    <CheckedIcon style={{ width: 38, height: 38 }} />
                                ) : (
                                    <UncheckIcon />
                                )}
                            </ListItemIcon>
                            <WalletUI address={x.identity} />
                        </MenuItem>
                    ))}
                <Divider />

                <MenuItem key="settings">
                    <ListItemIcon>
                        <WalletSettingIcon />
                    </ListItemIcon>
                    Wallet settings
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
        stroke: theme.palette.text.primary,
        cursor: 'pointer',
    },
    link: {},
    linkIcon: {},
}))

interface WalletUIProps {
    address: string
}

function WalletUI(props: WalletUIProps) {
    const { Utils } = useWeb3State()
    const { address } = props
    const networkDescriptor = useNetworkDescriptor()
    const { classes } = useWalletUIStyles()

    return (
        <Stack direction="row" alignItems="center" justifyContent="center">
            <ImageIcon size={30} icon={networkDescriptor?.icon} />
            <Stack direction="column" sx={{ marginLeft: 0.5 }}>
                <Stack fontSize={14}>
                    <ReversedAddress address={address} />
                </Stack>
                <Stack direction="row" alignItems="center">
                    <Typography className={classes.address}>{formatEthereumAddress(address, 4)}</Typography>
                    <CopyIconButton text={address} className={classes.copy} />
                    <Link
                        className={classes.link}
                        href={Utils?.resolveAddressLink?.(1, address) ?? ''}
                        target="_blank"
                        title="View on Explorer"
                        rel="noopener noreferrer">
                        <ExternalLink className={classes.linkIcon} size={14} />
                    </Link>
                </Stack>
            </Stack>
        </Stack>
    )
}
