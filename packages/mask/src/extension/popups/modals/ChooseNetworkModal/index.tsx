import { Flags } from '@masknet/flags'
import { Icons } from '@masknet/icons'
import { ChainIcon, WalletIcon } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useBalance, useChainContext, useNativeToken } from '@masknet/web3-hooks-base'
import { Web3 } from '@masknet/web3-providers'
import { formatBalance, type NetworkDescriptor } from '@masknet/web3-shared-base'
import { ProviderType, type ChainId, type NetworkType } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEvmNetworks } from '../../../../utils/networks.js'
import { ActionModal, useActionModal, type ActionModalBaseProps } from '../../components/index.js'

const useStyles = makeStyles()((theme) => ({
    networkList: {
        paddingLeft: 0,
        margin: 0,
        display: 'grid',
        gap: theme.spacing(2),
        gridTemplateColumns: '1fr 1fr',
    },
    network: {
        display: 'flex',
        alignItems: 'center',
        listStyle: 'none',
        borderRadius: 8,
        padding: theme.spacing(1.5),
        border: `1px solid ${theme.palette.maskColor.line}`,
    },
    text: {
        marginLeft: theme.spacing(1),
        marginRight: 'auto',
    },
    name: {
        fontSize: 12,
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        lineHeight: '16px',
    },
    balance: {
        fontSize: 12,
        color: theme.palette.maskColor.second,
        fontWeight: 700,
        lineHeight: '16px',
    },
}))

interface NetworkItemProps {
    currentChainId: ChainId
    network: NetworkDescriptor<ChainId, NetworkType>
}
const NetworkItem = memo(function NetworkItem({ network, currentChainId }: NetworkItemProps) {
    const { classes, theme } = useStyles()
    const { closeModal } = useActionModal()
    const chainId = network.chainId
    const liRef = useRef<HTMLLIElement>(null)
    const selected = chainId === currentChainId

    useEffect(() => {
        if (!selected) return
        liRef.current?.scrollIntoView()
    }, [selected, liRef.current])

    const { data: balance, isLoading: loadingBalance } = useBalance(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { data: token, isLoading: loadingToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })
    const loading = loadingBalance || loadingToken

    return (
        <li
            className={classes.network}
            role="option"
            ref={liRef}
            onClick={async () => {
                await Web3.switchChain?.(chainId, {
                    providerType: ProviderType.MaskWallet,
                })
                closeModal()
            }}>
            {network.icon ? <WalletIcon size={24} mainIcon={network.icon} /> : <ChainIcon color={network.iconColor} />}
            <Box className={classes.text}>
                <Typography className={classes.name}>{network.name}</Typography>
                <Typography className={classes.balance}>
                    {loading ? '--' : `${formatBalance(balance, token?.decimals)} ${token?.symbol}`}
                </Typography>
            </Box>
            {selected ? (
                <Icons.RadioButtonChecked size={20} />
            ) : (
                <Icons.RadioButtonUnChecked size={20} color={theme.palette.maskColor.line} />
            )}
        </li>
    )
})

export interface ChooseNetworkModalProps extends ActionModalBaseProps {
    chainId: ChainId
}

export const ChooseNetworkModal = memo(function ChooseNetworkModal({ ...rest }: ActionModalBaseProps) {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const networks = useMemo(() => getEvmNetworks(Flags.support_testnet_switch), [])

    const action = (
        <ActionButton fullWidth onClick={() => navigate(PopupRoutes.NetworkManagement)}>
            Management network
        </ActionButton>
    )

    return (
        <ActionModal header="Network" action={action} keepMounted {...rest}>
            <ul className={classes.networkList}>
                {networks.map((network) => (
                    <NetworkItem key={network.chainId} currentChainId={currentChainId} network={network} />
                ))}
            </ul>
        </ActionModal>
    )
})
