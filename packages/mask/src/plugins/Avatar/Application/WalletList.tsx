import { makeStyles, MaskColorVar } from '@masknet/theme'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { Button, ListItemIcon, MenuItem } from '@mui/material'
import { CheckedIcon, UncheckIcon } from '../assets/checked'
import type { BindingProof } from '@masknet/shared-base'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import classNames from 'classnames'
import { ChainId } from '@masknet/web3-shared-evm'
import { WalletUI } from './WalletMenuUI'
import { useI18N } from '../locales'

const useStyles = makeStyles()((theme) => ({
    root: {
        borderRadius: 9999,
        paddingLeft: 4,
        paddingRight: 4,
        cursor: 'pointer',
        backgroundColor: theme.palette.mode === 'dark' ? '#15171A' : '#F6F8F8',
    },
    wrapper: {},
    address: {
        lineHeight: 1.5,
    },
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
    divider: {
        borderColor: theme.palette.mode === 'dark' ? '#2F3336' : '#F2F5F6',
        marginLeft: 16,
        marginRight: 16,
    },
    paper: {
        backgroundColor: 'black',
        width: 335,
    },
}))

interface WalletItemProps {
    walletName?: string
    wallet: string
    onSelectedWallet?: (address: string, pluginId: NetworkPluginID, chainId: ChainId) => void
    nextIDWallets?: BindingProof[]
    selectedWallet?: string
    chainId: ChainId
    haveChangeWallet?: boolean
    onConnectWallet?: () => void
    providerIcon?: URL
}
export function WalletItem(props: WalletItemProps) {
    const { classes } = useStyles()
    const {
        walletName,
        wallet,
        nextIDWallets = [],
        selectedWallet,
        chainId,
        onSelectedWallet,
        haveChangeWallet = false,
        onConnectWallet,
        providerIcon,
    } = props
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const t = useI18N()

    const verify = nextIDWallets.some((x) => isSameAddress(x.identity, wallet))
    const isETH = verify || currentPluginId === NetworkPluginID.PLUGIN_EVM

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
                    <CheckedIcon className={classNames(classes.icon, classes.iconShadow)} />
                ) : (
                    <UncheckIcon className={classes.icon} />
                )}
            </ListItemIcon>
            <WalletUI
                providerIcon={providerIcon}
                chainId={chainId}
                name={walletName}
                address={wallet}
                verify={verify}
                isETH={isETH}
            />
            {haveChangeWallet && (
                <Button size="small" className={classes.change} onClick={onConnectWallet}>
                    {t.change()}
                </Button>
            )}
        </MenuItem>
    )
}
