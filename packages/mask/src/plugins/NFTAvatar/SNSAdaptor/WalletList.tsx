import { useNetworkDescriptor, useWeb3State } from '@masknet/plugin-infra'
import { ImageIcon, ReversedAddress } from '@masknet/shared'
import { NextIDPlatform } from '@masknet/shared-base'
import { makeStyles, ShadowRootMenu, useStylesExtends } from '@masknet/theme'
import { queryExistedBindingByPersona } from '@masknet/web3-providers'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Button, CircularProgress, Divider, Link, ListItemIcon, MenuItem, Stack, Typography } from '@mui/material'
import { first } from 'lodash-unified'
import { useCallback, useState } from 'react'
import { ExternalLink } from 'react-feather'
import { useAsyncRetry } from 'react-use'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'
import { CopyIconButton } from '../../NextID/components/CopyIconButton'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { CheckedIcon, UncheckIcon } from '../assets/checked'
import { WalletSettingIcon } from '../assets/setting'
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
    const currentIdentity = useCurrentVisitingIdentity()
    const personaIdentity = useLastRecognizedIdentity()
    const currentConnectedPersona = usePersonaConnectStatus()
    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!currentIdentity) return
        return Services.Identity.queryPersonaByProfile(currentIdentity.identifier)
    }, [currentIdentity, currentConnectedPersona.hasPersona])

    const isOwn = personaIdentity.identifier.toText() === currentIdentity.identifier.toText()
    const {
        value: bindings,
        loading,
        retry: retryQueryBinding,
    } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return queryExistedBindingByPersona(currentPersona.publicHexKey!)
    }, [currentPersona, isOwn])

    const wallets = bindings?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum)
    const wallet = first(wallets)

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const onClose = () => setAnchorEl(null)
    const onOpen = (event: React.MouseEvent<HTMLDivElement>) => setAnchorEl(event.currentTarget)

    const [selectedWallet, setSelectedWallet] = useState(wallet?.identity)
    const onClick = useCallback((address: string) => {
        onChange(address)
        setSelectedWallet(address)
        onClose()
    }, [])

    // useEffect(() => setSelectedWallet(wallet?.identity), [wallet])

    if (loading || loadingPersona) {
        return (
            <div className={classes.root}>
                <CircularProgress size="small" />
            </div>
        )
    }

    console.log(selectedWallet)
    if (!wallets?.length || !wallet) return null

    return (
        <Stack className={classes.root} onClick={onOpen}>
            <Stack direction="row" alignItems="center" justifyContent="center" className={classes.wrapper}>
                <WalletUI address={wallet.identity} />
                <ArrowDropDownIcon />
            </Stack>
            <ShadowRootMenu open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
                {wallets?.map((x) => (
                    <MenuItem key={x.identity} value={x.identity} onClick={() => onClick(x.identity)}>
                        <ListItemIcon>
                            {selectedWallet ? <CheckedIcon style={{ width: 38, height: 38 }} /> : <UncheckIcon />}
                        </ListItemIcon>
                        <WalletUI address={x.identity} />
                        {x.platform === NextIDPlatform.Ethereum && <Button style={{ marginLeft: 16 }}>Change</Button>}
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
