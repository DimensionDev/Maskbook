import { memo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@masknet/icons'
import { ImageIcon, NetworkIcon, ProgressiveText } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { useBalance, useNetwork, useNetworks, useWeb3State } from '@masknet/web3-hooks-base'
import { Web3 } from '@masknet/web3-providers'
import { formatBalance, type ReasonableNetwork } from '@masknet/web3-shared-base'
import { ProviderType, type ChainId, type NetworkType, type SchemaType } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { ActionModal, useActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'

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
    const liRef = useRef<HTMLLIElement>(null)
    const selected = network.ID === currentNetworkId
    const { Network } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    useEffect(() => {
        if (!selected) return
        liRef.current?.scrollIntoView()
    }, [selected, liRef.current])

    const providerURL = network.isCustomized ? network.rpcUrl : undefined
    const { data: balance, isLoading: loadingBalance } = useBalance(NetworkPluginID.PLUGIN_EVM, {
        chainId,
        providerURL,
    })
    const token = network.nativeCurrency

    return (
        <li
            className={classes.network}
            role="option"
            ref={liRef}
            onClick={async () => {
                await Network?.switchNetwork(network.ID)
                await Web3.switchChain?.(chainId, {
                    providerType: ProviderType.MaskWallet,
                })
                closeModal()
            }}>
            <div className={classes.icon}>
                {network.iconUrl ? (
                    <ImageIcon size={24} icon={network.iconUrl} name={network.name} />
                ) : (
                    <NetworkIcon
                        pluginID={NetworkPluginID.PLUGIN_EVM}
                        chainId={network.chainId}
                        size={24}
                        color={network.color}
                        name={network.name}
                        preferName={network.isCustomized}
                    />
                )}
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
                    {`${formatBalance(balance, token?.decimals, 0, false, true)} ${token?.symbol}`}
                </ProgressiveText>
            </div>
            {selected ? (
                <Icons.RadioButtonChecked size={20} />
            ) : (
                <Icons.RadioButtonUnChecked size={20} color={theme.palette.maskColor.line} />
            )}
        </li>
    )
})

export const ChooseNetworkModal = memo(function ChooseNetworkModal({ ...rest }: ActionModalBaseProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const network = useNetwork(NetworkPluginID.PLUGIN_EVM)
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)

    const action = (
        <ActionButton fullWidth onClick={() => navigate(PopupRoutes.NetworkManagement)}>
            {t('manage_network')}
        </ActionButton>
    )

    const currentNetworkId = network?.ID

    return (
        <ActionModal header={t('network')} action={action} keepMounted {...rest}>
            <ul className={classes.networkList}>
                {networks.map((network) => (
                    <NetworkItem key={network.ID} currentNetworkId={currentNetworkId} network={network} />
                ))}
            </ul>
        </ActionModal>
    )
})
