import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, List } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ProviderType } from '@masknet/web3-shared-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ECKeyIdentifier, NetworkPluginID, PopupRoutes, MAX_WALLET_LIMIT } from '@masknet/shared-base'
import { useChainContext, useWallet, useWallets } from '@masknet/web3-hooks-base'
import { Web3 } from '@masknet/web3-providers'
import { WalletItem } from './WalletItem.js'
import { useI18N } from '../../../../../utils/index.js'
import { Services } from '../../../../service.js'
import { PopupContext } from '../../../hook/usePopupContext.js'

const useStyles = makeStyles()({
    content: {
        overflow: 'auto',
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
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
    secondaryButton: {
        backgroundColor: '#F7F9FA',
        color: '#1C68F3',
        '&:hover': {
            backgroundColor: 'rgba(28, 104, 243, 0.04)',
        },
    },
})

const SwitchWallet = memo(() => {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const { smartPayChainId } = PopupContext.useContainer()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const { setChainId, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const handleClickCreate = useCallback(() => {
        if (!wallets.filter((x) => x.hasDerivationPath).length) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/dashboard.html#/create-mask-wallet/form'),
            })
        } else {
            navigate(PopupRoutes.CreateWallet)
        }
    }, [wallets, history])

    const handleSelect = useCallback(
        async (address: string | undefined, options?: { owner?: string; identifier?: ECKeyIdentifier }) => {
            await Web3.connect({
                account: address,
                chainId: options?.owner && smartPayChainId ? smartPayChainId : chainId,
                providerType: ProviderType.MaskWallet,
                ...options,
            })
            if (options?.owner && smartPayChainId) setChainId(smartPayChainId)
            navigate(PopupRoutes.Wallet, { replace: true })
        },
        [history, smartPayChainId, chainId],
    )
    return (
        <>
            <div className={classes.content}>
                <List dense className={classes.list}>
                    {wallets.map((item, index) => (
                        <WalletItem
                            key={index}
                            wallet={item}
                            onClick={() =>
                                handleSelect(
                                    item.address,
                                    item.owner
                                        ? {
                                              owner: item.owner,
                                              identifier: ECKeyIdentifier.from(item.identifier).unwrapOr(undefined),
                                          }
                                        : undefined,
                                )
                            }
                            isSelected={isSameAddress(item.address, wallet?.address)}
                        />
                    ))}
                </List>
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={cx(classes.button, classes.secondaryButton)}
                    disabled={wallets.length >= MAX_WALLET_LIMIT}
                    onClick={handleClickCreate}>
                    {t('create')}
                </Button>
                <Button
                    variant="contained"
                    disabled={wallets.length >= MAX_WALLET_LIMIT}
                    className={classes.button}
                    onClick={() => {
                        if (navigator.userAgent.includes('Firefox')) {
                            Services.Helper.openPopupWindow(PopupRoutes.ImportWallet)
                            return
                        }
                        navigate(PopupRoutes.ImportWallet)
                    }}>
                    {t('import')}
                </Button>
            </div>
        </>
    )
})

export default SwitchWallet
