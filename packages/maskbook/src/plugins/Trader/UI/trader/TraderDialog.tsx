import { useCallback, useState } from 'react'
import { DialogContent } from '@material-ui/core'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useRemoteControlledDialog } from '@masknet/shared'
import { TradeFooter } from './TradeFooter'
import type { FootnoteMenuOption } from '../trader/FootnoteMenu'
import { TradeContext, useTradeContext } from '../../trader/useTradeContext'
import { useCurrentTradeProvider } from '../../trending/useCurrentTradeProvider'
import { useAvailableTraderProviders } from '../../trending/useAvailableTraderProviders'
import { currentTradeProviderSettings } from '../../settings'
import { TradeProvider, TagType } from '../../types'
import { PluginTraderMessages } from '../../messages'
import { Trader, TraderProps } from './Trader'
import { useI18N } from '../../../../utils'

export function TraderDialog() {
    const { t } = useI18N()
    const [traderProps, setTraderProps] = useState<TraderProps>()

    const { open, closeDialog } = useRemoteControlledDialog(PluginTraderMessages.events.swapDialogUpdated, (ev) => {
        if (ev?.traderProps) setTraderProps(ev.traderProps)
    })

    const { value: tradeProviders = [] } = useAvailableTraderProviders(TagType.CASH, 'MASK')
    const tradeProvider = useCurrentTradeProvider(tradeProviders)
    const tradeContext = useTradeContext(tradeProvider)

    const onTradeProviderChange = useCallback((option: FootnoteMenuOption) => {
        currentTradeProviderSettings.value = option.value as TradeProvider
    }, [])

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
