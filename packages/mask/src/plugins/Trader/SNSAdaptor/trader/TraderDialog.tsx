import { useEffect, useState } from 'react'
import { usePluginIDContext } from '@masknet/plugin-infra'
import { ChainId, useChainId, useChainIdValid } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useRemoteControlledDialog } from '@masknet/shared'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import { TargetChainIdContext } from '../../trader/useTargetChainIdContext'
import { PluginTraderMessages } from '../../messages'
import { Trader, TraderProps } from './Trader'
import { useI18N } from '../../../../utils'
import { makeStyles } from '@masknet/theme'
import { WalletStatusBox } from '../../../../components/shared/WalletStatusBox'
import { NetworkTab } from '../../../../components/shared/NetworkTab'
import { useUpdateEffect } from 'react-use'
import { isDashboardPage } from '@masknet/shared-base'
import { base as Trader_Definition } from '../../base'

const useStyles = makeStyles()((theme) => ({
    walletStatusBox: {
        width: 535,
        margin: '24px auto',
    },
    abstractTabWrapper: {
        width: '100%',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
    },
    tab: {
        height: 36,
        minHeight: 36,
    },
    tabPaper: {
        backgroundColor: 'inherit',
    },
    tabs: {
        width: 535,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
    content: {
        paddingTop: 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    tradeRoot: {
        width: 535,
        margin: 'auto',
    },
}))

interface TraderDialogProps {
    open?: boolean
    onClose?: () => void
}

export function TraderDialog({ open, onClose }: TraderDialogProps) {
    const isDashboard = isDashboardPage()
    const pluginID = usePluginIDContext()
    const chainIdList = Trader_Definition.enableRequirement.web3?.[pluginID]?.supportedChainIds!
    const { t } = useI18N()
    const { classes } = useStyles()
    const currentChainId = useChainId()
    const chainIdValid = useChainIdValid()
    const [traderProps, setTraderProps] = useState<TraderProps>()
    const [chainId, setChainId] = useState<ChainId>(currentChainId)

    const { open: remoteOpen, closeDialog } = useRemoteControlledDialog(
        PluginTraderMessages.swapDialogUpdated,
        (ev) => {
            if (ev?.traderProps) setTraderProps(ev.traderProps)
        },
    )

    useEffect(() => {
        if (!chainIdValid) closeDialog()
    }, [chainIdValid, closeDialog])

    useUpdateEffect(() => {
        if (currentChainId) {
            setChainId(currentChainId)
        }
    }, [currentChainId])

    return (
        <TargetChainIdContext.Provider>
            <AllProviderTradeContext.Provider>
                <InjectedDialog
                    open={open || remoteOpen}
                    onClose={() => {
                        onClose?.()
                        setTraderProps(undefined)
                        closeDialog()
                    }}
                    title={t('plugin_trader_swap')}>
                    <DialogContent className={classes.content}>
                        {!isDashboard ? (
                            <div className={classes.walletStatusBox}>
                                <WalletStatusBox />
                            </div>
                        ) : null}
                        <div className={classes.abstractTabWrapper}>
                            <NetworkTab
                                chainId={chainId}
                                setChainId={setChainId}
                                classes={classes}
                                chains={chainIdList}
                            />
                        </div>
                        <Trader {...traderProps} chainId={chainId} classes={{ root: classes.tradeRoot }} />
                    </DialogContent>
                </InjectedDialog>
            </AllProviderTradeContext.Provider>
        </TargetChainIdContext.Provider>
    )
}
