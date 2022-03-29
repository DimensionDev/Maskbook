import { useEffect, useState } from 'react'
import { PluginId } from '@masknet/plugin-infra'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { ChainId, useChainId, useChainIdValid } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
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

const useStyles = makeStyles()((theme) => ({
    walletStatusBox: {
        width: 535,
        margin: theme.spacing(3, 'auto'),
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
    networkTab: {
        width: 535,
        margin: theme.spacing(1, 'auto', 2),
    },
}))

interface TraderDialogProps {
    open?: boolean
    onClose?: () => void
}

export function TraderDialog({ open, onClose }: TraderDialogProps) {
    const isDashboard = isDashboardPage()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const traderDefinition = useActivatedPlugin(PluginId.Trader, 'any')
    const chainIdList = traderDefinition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? []
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
                        <NetworkTab
                            chainId={chainId}
                            setChainId={setChainId}
                            className={classes.networkTab}
                            chains={chainIdList}
                        />
                        <Trader {...traderProps} chainId={chainId} classes={{ root: classes.tradeRoot }} />
                    </DialogContent>
                </InjectedDialog>
            </AllProviderTradeContext.Provider>
        </TargetChainIdContext.Provider>
    )
}
