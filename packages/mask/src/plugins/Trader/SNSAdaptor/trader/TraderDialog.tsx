import { useEffect, useState } from 'react'
import { ChainId, getChainIdFromNetworkType, useChainId, useChainIdValid } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useRemoteControlledDialog } from '@masknet/shared'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import { PluginTraderMessages } from '../../messages'
import { Trader, TraderProps } from './Trader'
import { useI18N } from '../../../../utils'
import { makeStyles } from '@masknet/theme'
import { WalletStatusBox } from '../../../../components/shared/WalletStatusBox'
import { NetworkTab } from '../../../../components/shared/NetworkTab'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../../Wallet/messages'

const useStyles = makeStyles()((theme) => ({
    walletStatusBox: {
        width: 535,
        margin: '24px auto',
    },
    abstractTabWrapper: {
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 2,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
    },
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
    },
    tabs: {
        width: 536,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
        backgroundColor: theme.palette.background.default,
        '& .Mui-selected': {
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
        },
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
}))

export function TraderDialog() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const currentChainId = useChainId()
    const chainIdValid = useChainIdValid()
    const [traderProps, setTraderProps] = useState<TraderProps>()
    const [chainId, setChainId] = useState<ChainId>(currentChainId)

    const { open, closeDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated, (ev) => {
        if (ev?.traderProps) setTraderProps(ev.traderProps)
    })

    const { value: chains } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network) => getChainIdFromNetworkType(network))
    }, [])

    useEffect(() => {
        if (!chainIdValid) closeDialog()
    }, [chainIdValid, closeDialog])

    return (
        <AllProviderTradeContext.Provider>
            <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_trader_swap')}>
                <DialogContent>
                    <div className={classes.walletStatusBox}>
                        <WalletStatusBox />
                    </div>
                    <div className={classes.abstractTabWrapper}>
                        <NetworkTab chainId={chainId} setChainId={setChainId} classes={classes} chains={chains ?? []} />
                    </div>
                    <Trader {...traderProps} chainId={chainId} />
                </DialogContent>
            </InjectedDialog>
        </AllProviderTradeContext.Provider>
    )
}
