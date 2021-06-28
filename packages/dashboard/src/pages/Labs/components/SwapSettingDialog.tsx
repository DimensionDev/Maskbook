import { MaskDialog } from '@masknet/theme'
import { DialogContent } from '@material-ui/core'
import { useState } from 'react'
import { useDashboardI18N } from '../../../locales'

import SettingItem from './SettingItem'

export interface SettingDialogProps {
    open: boolean
    onClose(): void
}
export default function SwapSettingDialog({ open, onClose }: SettingDialogProps) {
    const ethOptions = [
        { label: 'UniSwap', value: 0 },
        { label: 'SushiSwap', value: 1 },
        { label: 'Ox', value: 2 },
    ]

    const t = useDashboardI18N()

    // TODO: save setting
    const [ethValue, setEthValue] = useState(0)

    const polygonOptions = [{ label: 'QuickSwap', value: 0 }]

    const bscOptions = [{ label: 'PancakeSwap', value: 0 }]

    return (
        <MaskDialog title={t.labs_settings_swap()} open={open} onClose={onClose}>
            <DialogContent sx={{ padding: '16px 40px 24px' }}>
                <SettingItem
                    legend={t.labs_settings_swap_eth()}
                    value={ethValue}
                    options={ethOptions}
                    onChange={(value) => setEthValue(+value)}
                />
                <SettingItem legend={t.labs_settings_swap_polygon()} value={0} options={polygonOptions} />
                <SettingItem legend={t.labs_settings_swap_bsc()} value={0} options={bscOptions} />
            </DialogContent>
        </MaskDialog>
    )
}
