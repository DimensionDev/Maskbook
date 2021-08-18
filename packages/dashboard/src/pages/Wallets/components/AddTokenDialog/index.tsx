import { memo } from 'react'
import { MaskDialog, useTabs } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import { Tab } from '@material-ui/core'
import { AddCustomToken } from './AddCustomToken'
import { AddTokenFromList } from './AddTokenFromList'

export interface AddTokenDialogProps {
    open: boolean
    onClose: () => void
}

export const AddTokenDialog = memo<AddTokenDialogProps>(({ open, onClose }) => {
    const t = useDashboardI18N()
    const [currentTab, onChange, tabs] = useTabs('searchToken', 'customToken')

    return (
        <MaskDialog maxWidth="md" open={open} title={t.wallets_add_token()} onClose={onClose}>
            <TabContext value={currentTab}>
                <TabList onChange={onChange}>
                    <Tab sx={{ width: '50%' }} label="SearchToken" value={tabs.searchToken} />
                    <Tab sx={{ width: '50%' }} label="Custom Token" value={tabs.customToken} />
                </TabList>
                <TabPanel value={tabs.searchToken}>
                    <AddCustomToken onClose={onClose} />
                </TabPanel>
                <TabPanel value={tabs.customToken}>
                    <AddTokenFromList />
                </TabPanel>
            </TabContext>
        </MaskDialog>
    )
})
