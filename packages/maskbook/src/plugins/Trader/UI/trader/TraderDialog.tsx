import { useCallback, useState } from 'react'
import { DialogContent } from '@material-ui/core'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { TradeFooter } from './TradeFooter'
import type { FootnoteMenuOption } from '../trader/FootnoteMenu'
import { TradeContext, useTradeContext } from '../../trader/useTradeContext'
import { useCurrentTradeProvider } from '../../trending/useCurrentTradeProvider'
import { useAvailableTraderProviders } from '../../trending/useAvailableTraderProviders'
import { currentTradeProviderSettings } from '../../settings'
import { TradeProvider, TagType } from '../../types'
import { PluginTraderMessages } from '../../messages'
import { Trader, TraderProps } from './Trader'

export function TraderDialog() {
    const [traderProps, setTraderProps] = useState<TraderProps>()

    const { open, closeDialog } = useRemoteControlledDialog(PluginTraderMessages.events.swapDialogUpdated, (ev) => {
        if (ev?.traderProps) setTraderProps(ev.traderProps)
    })

    const onTradeProviderChange = useCallback((option: FootnoteMenuOption) => {
        currentTradeProviderSettings.value = option.value as TradeProvider
    }, [])
    const { value: tradeProviders = [] } = useAvailableTraderProviders(TagType.CASH, 'MASK')
    const tradeProvider = useCurrentTradeProvider(tradeProviders)
    const tradeContext = useTradeContext(tradeProvider)
    return (
        <TradeContext.Provider value={tradeContext}>
            <InjectedDialog open={open} onClose={closeDialog} title="Swap">
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
