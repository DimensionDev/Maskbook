import { useEffect, useCallback, useState } from 'react'
import { useChainIdValid } from '@masknet/web3-shared'
import { DialogContent } from '@material-ui/core'
import type { TradeProvider } from '@masknet/public-api'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useRemoteControlledDialog } from '@masknet/shared'
import { TradeFooter } from './TradeFooter'
import type { FootnoteMenuOption } from './FootnoteMenu'
import { TradeContext, useTradeContext } from '../../trader/useTradeContext'
import { useCurrentTradeProvider } from '../../trending/useCurrentTradeProvider'
import { useAvailableTraderProviders } from '../../trending/useAvailableTraderProviders'
import { currentTradeProviderSettings } from '../../settings'
import { TagType } from '../../types'
import { PluginTraderMessages } from '../../messages'
import { Trader, TraderProps } from './Trader'
import { useI18N } from '../../../../utils'

export function TraderDialog() {
    const { t } = useI18N()
    const chainIdValid = useChainIdValid()
    const [traderProps, setTraderProps] = useState<TraderProps>()

    const { open, closeDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated, (ev) => {
        if (ev?.traderProps) setTraderProps(ev.traderProps)
    })

    const { value: tradeProviders = [] } = useAvailableTraderProviders(TagType.CASH, 'MASK')
    const tradeProvider = useCurrentTradeProvider()
    const tradeContext = useTradeContext(tradeProvider)

    const onTradeProviderChange = useCallback((option: FootnoteMenuOption) => {
        currentTradeProviderSettings.value = option.value as TradeProvider
    }, [])

    useEffect(() => {
        if (!chainIdValid) closeDialog()
    }, [chainIdValid, closeDialog])

    return (
        <TradeContext.Provider value={tradeContext}>
            <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_trader_swap')}>
                <DialogContent>
                    <Trader {...traderProps} />
                    <TradeFooter
                        showDataProviderIcon={false}
                        showTradeProviderIcon
                        tradeProvider={tradeProvider}
                        tradeProviders={tradeProviders}
                        onTradeProviderChange={onTradeProviderChange}
                    />
                </DialogContent>
            </InjectedDialog>
        </TradeContext.Provider>
    )
}
