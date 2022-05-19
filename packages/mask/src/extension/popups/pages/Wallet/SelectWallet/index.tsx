import { memo, useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { first } from 'lodash-unified'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { Button, List, Typography } from '@mui/material'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useI18N } from '../../../../../utils'
import Services from '../../../../service'
import { WalletItem } from './WalletItem'
import {
    useAccount,
    useChainIdValid,
    useWallets,
    getRegisteredWeb3Networks,
    Web3Helper,
    useChainId,
} from '@masknet/plugin-infra/web3'
import { ChainIcon } from '@masknet/shared'
import { PopupRoutes } from '@masknet/shared-base'

const useStyles = makeStyles()({
    content: {
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
    placeholder: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 10,
        display: 'flex',
        marginBottom: 1,
        backgroundColor: '#ffffff',
    },
    network: {
        minWidth: 114,
        padding: '4px 12px 4px 4px',
        minHeight: 28,
        borderRadius: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1c68f3',
    },
    title: {
        color: '#ffffff',
        fontSize: 12,
        lineHeight: '16px',
    },
    iconWrapper: {
        width: 20,
        height: 20,
        borderRadius: 20,
        marginRight: 10,
    },
    list: {
        backgroundColor: '#ffffff',
        padding: 0,
        height: 'calc(100vh - 168px)',
        overflow: 'auto',
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: 16,
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
})

const SelectWallet = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const location = useLocation()
    const navigate = useNavigate()

    const networks = getRegisteredWeb3Networks().filter(
        (x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM,
    ) as Web3Helper.Web3NetworkDescriptor<NetworkPluginID.PLUGIN_EVM>[]

    const search = new URLSearchParams(location.search)
    // The previous page is popup page
    const isPopup = search.get('popup')
    // The opener need to switch to specific chain
    const chainIdSearched = search.get('chainId')
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(
        NetworkPluginID.PLUGIN_EVM,
        chainIdSearched ? (Number.parseInt(chainIdSearched, 10) as ChainId) : undefined,
    )
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM, chainId)
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM).filter((x) => x.hasStoredKeyInfo)

    const [selected, setSelected] = useState(account)

    const currentNetwork = networks.find((x) => x.chainId === chainId)

    const handleCancel = useCallback(async () => {
        if (isPopup) {
            navigate(-1)
        } else {
            await WalletRPC.selectMaskAccount([])
            await Services.Helper.removePopupWindow()
        }
    }, [isPopup])

    const handleConfirm = useCallback(async () => {
        if (isPopup) {
            navigate(PopupRoutes.VerifyWallet, {
                state: {
                    chainId,
                    account: selected,
                    networkType: getNetworkTypeFromChainId(chainId),
                    providerType: ProviderType.MaskWallet,
                },
            })
            return
        }

        await WalletRPC.updateMaskAccount({
            chainId,
            account: selected,
        })
        if (chainId) {
            await WalletRPC.selectMaskAccount([selected])
        }
        return Services.Helper.removePopupWindow()
    }, [chainId, selected, isPopup])

    useEffect(() => {
        if (!selected && wallets.length) setSelected(first(wallets)?.address ?? '')
    }, [selected, wallets])

    if (!wallets.length) {
        return (
            <div className={classes.placeholder}>
                <Typography>{t('popups_wallet_no_wallet')}</Typography>
            </div>
        )
    }

    return chainId && chainIdValid ? (
        <>
            <div className={classes.content}>
                {currentNetwork ? (
                    <div className={classes.header}>
                        <div className={classes.network}>
                            <div className={classes.iconWrapper}>{<ChainIcon color={currentNetwork.iconColor} />}</div>
                            <Typography className={classes.title}>{currentNetwork.name}</Typography>
                        </div>
                    </div>
                ) : null}
                <List dense className={classes.list}>
                    {wallets.map((item, index) => (
                        <WalletItem
                            key={index}
                            wallet={item}
                            onClick={() => setSelected(item.address)}
                            isSelected={isSameAddress(item.address, selected)}
                        />
                    ))}
                </List>
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={classes.button}
                    style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}
                    onClick={handleCancel}>
                    {t('cancel')}
                </Button>
                <Button variant="contained" disabled={!selected} className={classes.button} onClick={handleConfirm}>
                    {t('confirm')}
                </Button>
            </div>
        </>
    ) : (
        <div className={classes.placeholder}>
            <Typography>{t('popups_wallet_unsupported_network')}</Typography>
        </div>
    )
})

export default SelectWallet
