import { InjectedDialog } from '@masknet/shared'
import { memo } from 'react'
import { useTraderTrans } from '../../locales/i18n_generated.js'
import { Box, DialogContent, Tab } from '@mui/material'
import { Icons } from '@masknet/icons'
import { MaskTabList, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'

export interface ExchangeDialogProps {
    open: boolean
    onClose: () => void
}

export const ExchangeDialog = memo<ExchangeDialogProps>(function ExchangeDialog({ open, onClose }) {
    const t = useTraderTrans()
    const [currentTab, onChange, tabs] = useTabs('swap', 'bridge')

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                onClose={onClose}
                title={t.plugin_trader_swap()}
                titleTail={
                    <Box display="flex" columnGap={1}>
                        <Icons.History size={24} />
                        <Icons.WalletSetting size={24} />
                    </Box>
                }
                titleTabs={
                    <MaskTabList variant="base" onChange={onChange}>
                        <Tab label={t.swap()} value={tabs.swap} />
                        <Tab label={t.bridge()} value={tabs.bridge} />
                    </MaskTabList>
                }>
                <DialogContent />
            </InjectedDialog>
        </TabContext>
    )
})
