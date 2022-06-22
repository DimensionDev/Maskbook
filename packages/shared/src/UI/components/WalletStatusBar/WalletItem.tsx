import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import type { BindingProof } from '@masknet/shared-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Button, ListItemIcon, MenuItem } from '@mui/material'
import classNames from 'classnames'
import { useSharedI18N } from '../../../locales/i18n_generated'
import { CheckedIcon, UncheckIcon } from '../../assets/Check'
import { WalletUI } from './WalletUI'

const useStyles = makeStyles()((theme) => ({
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

interface WalletItemProps {
    walletName: string
    selectedWallet: string
    wallet: string
    nextIDWallets?: BindingProof[]
    chainId: ChainId
    onConnectWallet?: () => void
    onSelectedWallet?: (address: string, pluginId: NetworkPluginID, chainId: ChainId) => void
}
export function WalletItem(props: WalletItemProps) {
    const { walletName, selectedWallet, wallet, onSelectedWallet, onConnectWallet, nextIDWallets = [], chainId } = props
    const t = useSharedI18N()
    const { classes } = useStyles()
    const currentPluginId = useCurrentWeb3NetworkPluginID()

    const verify = nextIDWallets.some((x) => isSameAddress(x.identity, wallet))
    const isETH = verify || currentPluginId === NetworkPluginID.PLUGIN_EVM
    const enableChange = Boolean(wallet)

    return (
        <MenuItem
            value={wallet}
            onClick={() =>
                onSelectedWallet?.(
                    wallet,
                    isETH ? NetworkPluginID.PLUGIN_EVM : currentPluginId,
                    nextIDWallets.some((x) => isSameAddress(x.identity, wallet))
                        ? ChainId.Mainnet
                        : (chainId as ChainId),
                )
            }>
            <ListItemIcon>
                {selectedWallet === wallet ? (
                    <>
                        <CheckedIcon className={classNames(classes.icon, classes.iconShadow)} />
                    </>
                ) : (
                    <UncheckIcon className={classes.icon} />
                )}
            </ListItemIcon>
            <WalletUI name={walletName} address={wallet} verify={verify} isETH={isETH} />
            {enableChange && (
                <Button size="small" className={classes.change} onClick={onConnectWallet}>
                    {t.change()}
                </Button>
            )}
        </MenuItem>
    )
}
