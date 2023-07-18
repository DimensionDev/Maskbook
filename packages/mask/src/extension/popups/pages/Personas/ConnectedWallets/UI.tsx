import { memo, useCallback, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { ChainId, explorerResolver, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { CopyButton, FormattedAddress, ImageIcon } from '@masknet/shared'
import { Button, Link, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import type { ConnectedWalletInfo } from '../type.js'
import { DisconnectWalletDialog } from '../components/DisconnectWalletDialog/index.js'
import { useI18N } from '../../../../../utils/index.js'
import { NetworkPluginID } from '@masknet/shared-base'

const useStyles = makeStyles()(() => ({
    container: {
        padding: '8px 16px 0 16px',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 12,
        flex: 1,
        backgroundColor: '#F7F9FA',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 108px)',
    },
    loading: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#F7F9FA',
        paddingBottom: 72,
    },
    animated: {
        '@keyframes loadingAnimation': {
            '0%': {
                transform: 'rotate(0deg)',
            },
            '100%': {
                transform: 'rotate(360deg)',
            },
        },
        animation: 'loadingAnimation 1s linear infinite',
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
        width: 16,
        height: 16,
        marginLeft: 4,
        cursor: 'pointer',
        color: '#767F8D',
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
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '16px 0',
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: '#07101B',
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(16px)',
    },
}))

interface ConnectedWalletsUIProps {
    wallets?: ConnectedWalletInfo[]
    chainId: ChainId
    onRelease: (wallet?: ConnectedWalletInfo) => Promise<void>
    onAddVerifyWallet: () => void
    releaseLoading: boolean
    personaName?: string
    loading: boolean
}

export const ConnectedWalletsUI = memo<ConnectedWalletsUIProps>(
    ({ wallets, chainId, onRelease, releaseLoading, personaName, onAddVerifyWallet, loading }) => {
        const { t } = useI18N()
        const { classes } = useStyles()
        const [open, setOpen] = useState(false)
        const [selectedWallet, setSelectedWallet] = useState<ConnectedWalletInfo>()

        const onDelete = useCallback((wallet: ConnectedWalletInfo) => {
            setSelectedWallet(wallet)
            setOpen(true)
        }, [])

        // TODO: remove this after next dot id support multiple chain
        const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, ChainId.Mainnet)

        if (loading)
            return (
                <div className={classes.loading}>
                    <Icons.CircleLoading className={classes.animated} />
                    <Typography>{t('popups_loading')}</Typography>
                    <Button className={classes.button} onClick={onAddVerifyWallet}>
                        {t('popups_add_and_verify_wallet')}
                    </Button>
                </div>
            )

        return (
            <div className={classes.container}>
                {wallets && wallets?.length > 0 ? (
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
                                    <CopyButton text={wallet.identity} className={classes.icon} size={16} />
                                    <Link
                                        style={{ width: 16, height: 16 }}
                                        href={explorerResolver.addressLink(chainId, wallet.identity ?? '')}
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        <Icons.PopupLink className={classes.icon} />
                                    </Link>
                                </Typography>
                            </div>
                            <Icons.Delete color="#767F8D" onClick={() => onDelete(wallet)} />
                        </div>
                    ))
                ) : (
                    <div className={classes.placeholder}>
                        <Icons.Empty size={60} />
                    </div>
                )}
                <DisconnectWalletDialog
                    confirmLoading={releaseLoading}
                    onConfirmDisconnect={async () => onRelease(selectedWallet)}
                    address={selectedWallet?.identity}
                    onClose={() => setOpen(false)}
                    open={open}
                    personaName={personaName}
                />

                <Button className={classes.button} onClick={onAddVerifyWallet}>
                    {t('popups_add_and_verify_wallet')}
                </Button>
            </div>
        )
    },
)
