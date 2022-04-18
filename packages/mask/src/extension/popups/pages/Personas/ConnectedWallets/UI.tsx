import { memo, useCallback, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { ChainId, formatEthereumAddress, resolveAddressLinkOnExplorer } from '@masknet/web3-shared-evm'
import { NetworkPluginID, useNetworkDescriptor } from '@masknet/plugin-infra/web3'
import { FormattedAddress, ImageIcon } from '@masknet/shared'
import { Button, Link, Typography } from '@mui/material'
import { CopyIconButton } from '../../../components/CopyIconButton'
import { DeleteIcon, EmptyIcon, PopupLinkIcon } from '@masknet/icons'
import type { ConnectedWalletInfo } from '../type'
import { DisconnectWalletDialog } from '../components/DisconnectWalletDialog'
import { useI18N } from '../../../../../utils'

const useStyles = makeStyles()(() => ({
    container: {
        padding: '8px 16px 0px 16px',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 12,
        flex: 1,
        backgroundColor: '#F7F9FA',
    },
    item: {
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 8,
    },
    content: {
        marginLeft: 8,
        flex: 1,
    },
    name: {
        fontSize: 14,
        lineHeight: '18px',
        color: '#0F1419',
        fontWeight: 700,
    },
    address: {
        color: '#536471',
        fontSize: 10,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        fontSize: 16,
        marginLeft: 4,
        cursor: 'pointer',
    },
    delete: {
        fontSize: 24,
        stroke: '#536471',
        cursor: 'pointer',
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        flex: 1,
    },
    button: {
        backgroundColor: '#ffffff',
        padding: '11px 20px',
        borderRadius: 99,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: '#07101B',
        position: 'fixed',
        bottom: 32,
        left: 32,
        right: 32,
    },
}))

interface ConnectedWalletsUIProps {
    wallets: ConnectedWalletInfo[]
    chainId: ChainId
    onRelease: (wallet?: ConnectedWalletInfo) => Promise<void>
    onAddVerifyWallet: () => void
    releaseLoading: boolean
    personaName?: string
}

export const ConnectedWalletsUI = memo<ConnectedWalletsUIProps>(
    ({ wallets, chainId, onRelease, releaseLoading, personaName, onAddVerifyWallet }) => {
        const { t } = useI18N()
        const { classes } = useStyles()
        const [open, setOpen] = useState(false)
        const [selectedWallet, setSelectedWallet] = useState<ConnectedWalletInfo>()

        const onDelete = useCallback((wallet: ConnectedWalletInfo) => {
            setSelectedWallet(wallet)
            setOpen(true)
        }, [])

        // TODO: remove this after next dot id support multiple chain
        const networkDescriptor = useNetworkDescriptor(ChainId.Mainnet, NetworkPluginID.PLUGIN_EVM)

        return (
            <div className={classes.container}>
                {wallets.length > 0 ? (
                    wallets.map((wallet, key) => (
                        <div className={classes.item} key={key}>
                            <ImageIcon size={30} icon={networkDescriptor?.icon} />
                            <div className={classes.content}>
                                <Typography className={classes.name}>{wallet.name}</Typography>
                                <Typography className={classes.address}>
                                    <FormattedAddress
                                        address={wallet.identity}
                                        size={4}
                                        formatter={formatEthereumAddress}
                                    />
                                    <CopyIconButton text={wallet.identity} className={classes.icon} />
                                    <Link
                                        style={{ width: 16, height: 16 }}
                                        href={resolveAddressLinkOnExplorer(chainId, wallet.identity ?? '')}
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        <PopupLinkIcon className={classes.icon} />
                                    </Link>
                                </Typography>
                            </div>
                            <DeleteIcon className={classes.delete} onClick={() => onDelete(wallet)} />
                        </div>
                    ))
                ) : (
                    <div className={classes.placeholder}>
                        <EmptyIcon style={{ fontSize: 60 }} />
                    </div>
                )}
                <DisconnectWalletDialog
                    confirmLoading={releaseLoading}
                    onConfirmDisconnect={async () => onRelease(selectedWallet)}
                    address={selectedWallet?.identity}
                    onClose={() => setOpen(false)}
                    open={open}
                />

                <Button className={classes.button} onClick={onAddVerifyWallet}>
                    {t('popups_add_and_verify_wallet')}
                </Button>
            </div>
        )
    },
)
