import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@masknet/icons'
import { ImageIcon, NetworkIcon, ProgressiveText } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { useBalance, useChainContext, useNetwork, useNetworks, useWeb3State } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { formatBalance, type ReasonableNetwork } from '@masknet/web3-shared-base'
import { ProviderType, type ChainId, type NetworkType, type SchemaType } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { ActionModal, useActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { Trans } from '@lingui/macro'

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
        overflow: 'auto',
    },
    icon: {
        width: 24,
        height: 24,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
    },
    text: {
        marginLeft: theme.spacing(1),
        marginRight: 'auto',
        overflow: 'auto',
    },
    name: {
        fontSize: 12,
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        lineHeight: '16px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    balance: {
        fontSize: 12,
        color: theme.palette.maskColor.second,
        fontWeight: 700,
        lineHeight: '16px',
    },
}))

interface NetworkItemProps {
    currentNetworkId: string | undefined
    network: ReasonableNetwork<ChainId, SchemaType, NetworkType>
}
const NetworkItem = memo(function NetworkItem({ network, currentNetworkId }: NetworkItemProps) {
    const { classes, theme } = useStyles()
    const { closeModal } = useActionModal()
    const chainId = network.chainId
    const selected = network.ID === currentNetworkId
    const { Network } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const providerURL = network.isCustomized ? network.rpcUrl : undefined
    const { data: balance, isPending: loadingBalance } = useBalance(NetworkPluginID.PLUGIN_EVM, {
        chainId,
        providerURL,
    })
    const token = network.nativeCurrency

    return (
        <li
            className={classes.network}
            role="option"
            ref={(element) => {
                if (!element || !selected) return
                if ('scrollIntoViewIfNeeded' in element && typeof element.scrollIntoViewIfNeeded === 'function') {
                    element.scrollIntoViewIfNeeded(true)
                } else {
                    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }
            }}
            onClick={async () => {
                await Network?.switchNetwork(network.ID)
                await EVMWeb3.switchChain?.(chainId, {
                    providerType: ProviderType.MaskWallet,
                })
                closeModal()
            }}>
            <div className={classes.icon}>
                {network.iconUrl ?
                    <ImageIcon size={24} icon={network.iconUrl} name={network.name} />
                :   <NetworkIcon
                        pluginID={NetworkPluginID.PLUGIN_EVM}
                        chainId={network.chainId}
                        size={24}
                        network={network}
                    />
                }
            </div>
            <div className={classes.text}>
                <TextOverflowTooltip title={network.name}>
                    <Typography className={classes.name}>{network.name}</Typography>
                </TextOverflowTooltip>
                <ProgressiveText
                    className={classes.balance}
                    loading={loadingBalance}
                    skeletonWidth={60}
                    skeletonHeight={16}>
                    {`${formatBalance(balance, token?.decimals, {
                        significant: 0,
                        isPrecise: false,
                        isFixed: true,
                    })} ${token?.symbol}`}
                </ProgressiveText>
            </div>
            {selected ?
                <Icons.RadioButtonChecked size={20} />
            :   <Icons.RadioButtonUnChecked size={20} color={theme.palette.maskColor.line} />}
        </li>
    )
})

export const ChooseNetworkModal = memo(function ChooseNetworkModal(props: ActionModalBaseProps) {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const network = useNetwork(NetworkPluginID.PLUGIN_EVM, chainId)
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)

    const action = (
        <ActionButton fullWidth onClick={() => navigate(PopupRoutes.NetworkManagement)}>
            <Trans>Manage Network</Trans>
        </ActionButton>
    )

    const currentNetworkId = network?.ID

    return (
        <ActionModal header={<Trans>Network</Trans>} action={action} keepMounted {...props}>
            <ul className={classes.networkList}>
                {networks.map((network) => (
                    <NetworkItem key={network.ID} currentNetworkId={currentNetworkId} network={network} />
                ))}
            </ul>
        </ActionModal>
    )
})
