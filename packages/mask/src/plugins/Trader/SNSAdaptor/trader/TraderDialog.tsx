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
import { NetworkTab } from '../../../../components/shared/NetworkTab'
import { useUpdateEffect } from 'react-use'
import { isDashboardPage } from '@masknet/shared-base'

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
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        padding: 0,
    },
    tradeRoot: {
        margin: 'auto',
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
