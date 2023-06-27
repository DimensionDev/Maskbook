import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { useLocation, useNavigate } from 'react-router-dom'
import { first } from 'lodash-es'
import { makeStyles } from '@masknet/theme'
import { Button, List, Typography } from '@mui/material'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ECKeyIdentifier, NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { type ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { useChainIdValid, useWallets, useChainContext } from '@masknet/web3-hooks-base'
import { getRegisteredWeb3Networks } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ChainIcon, WalletIcon } from '@masknet/shared'
import { useI18N } from '../../../../../utils/index.js'
import Services from '../../../../service.js'
import { WalletItem } from './WalletItem.js'
import { PopupContext } from '../../../hook/usePopupContext.js'
import { WalletStartUp } from '../components/StartUp/index.js'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'

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
        marginRight: 6,
    },
    list: {
        backgroundColor: '#F7F9FA',
        padding: 0,
        height: 'calc(100vh - 132px)',
        overflow: 'auto',
        paddingBottom: 70,
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
    colorChainIcon: {
        borderRadius: '999px!important',
        margin: '0 !important',
    },
})

const SelectWallet = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const location = useLocation()
    const navigate = useNavigate()
    const { smartPayChainId } = PopupContext.useContainer()

    const networks = getRegisteredWeb3Networks().filter(
        (x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM,
    ) as Array<Web3Helper.Web3NetworkDescriptor<NetworkPluginID.PLUGIN_EVM>>

    const search = new URLSearchParams(location.search)
    // The previous page is popup page
    const isPopup = search.get('popup')
    // The opener need to switch to specific chain
    const chainIdSearched = search.get('chainId')
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: chainIdSearched ? (Number.parseInt(chainIdSearched, 10) as ChainId) : undefined,
    })
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM, chainId)

    const { value: localWallets = [] } = useAsync(async () => WalletRPC.getWallets(), [])

    const allWallets = useWallets(NetworkPluginID.PLUGIN_EVM)

    const wallets = useMemo(() => {
        if (!allWallets.length && localWallets.length) return localWallets
        return allWallets
    }, [localWallets, allWallets])
    const [selected, setSelected] = useState(account)

    const currentNetwork = networks.find((x) => x.chainId === chainId)

    const handleCancel = useCallback(async () => {
        if (isPopup) {
            navigate(-1)
        } else {
            await WalletRPC.resolveMaskAccount([])
            await Services.Helper.removePopupWindow()
        }
    }, [isPopup])

    const handleConfirm = useCallback(async () => {
        if (isPopup) {
            navigate(PopupRoutes.VerifyWallet, {
                state: {
                    chainId,
                    account: selected,
                    providerType: ProviderType.MaskWallet,
                },
            })
            return
        }

        const wallet = wallets.find((x) => isSameAddress(x.address, selected))

        await WalletRPC.resolveMaskAccount([
            wallet?.owner
                ? {
                      address: selected,
                      owner: wallet.owner,
                      identifier: ECKeyIdentifier.from(wallet.identifier).unwrapOr(undefined),
                  }
                : {
                      address: selected,
                  },
        ])
        return Services.Helper.removePopupWindow()
    }, [chainId, selected, isPopup, wallets, smartPayChainId])

    useEffect(() => {
        if (!selected && wallets.length) setSelected(first(wallets)?.address ?? '')
    }, [selected, wallets, location.state])

    // Only SmartPay wallets exist and the chainId is not the support chainId
    if (!wallets.filter((x) => !x.owner).length && chainId !== smartPayChainId) {
        return <WalletStartUp />
    }

    return chainIdValid ? (
        <>
            <div className={classes.content}>
                {currentNetwork ? (
                    <div className={classes.header}>
                        <div className={classes.network}>
                            <div className={classes.iconWrapper}>
                                {currentNetwork.icon ? (
                                    <WalletIcon mainIcon={currentNetwork.icon} size={20} />
                                ) : (
                                    <ChainIcon
                                        color={currentNetwork.iconColor}
                                        size={20}
                                        classes={{ point: classes.colorChainIcon }}
                                    />
                                )}
                            </div>
                            <Typography className={classes.title}>{currentNetwork.name}</Typography>
                        </div>
                    </div>
                ) : null}
                <List dense className={classes.list}>
                    {wallets
                        .filter((x) => {
                            if (chainId === smartPayChainId) return true
                            return !x.owner
                        })
                        .map((item, index) => (
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
