import { InjectedDialog } from '@masknet/shared'
import { MaskTabList, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { CardDialogContent } from './CardDialogContent.js'
import { useI18N } from '../../../../../utils/index.js'
import { useStyles } from './hooks/useStyles.js'
import { TabType } from '../../types.js'
import { Context } from '../Context/index.js'

export interface CardDialogProps {
    open: boolean
    setOpen: (opened: boolean) => void
}

export function CardDialog(props: CardDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { chainId, pluginID, tokenId, tokenAddress } = Context.useContainer()

    const [currentTab, onChange] = useTabs<TabType>(TabType.About, TabType.Offers, TabType.Activities)

    if (!chainId || !pluginID) return null
    if (!tokenId || !tokenAddress) return null

    return (
        <InjectedDialog
            open={props.open}
            title={t('plugin_collectible_nft_detail')}
            onClose={() => props.setOpen(false)}
            classes={{ paper: classes.dialogRoot }}
            titleTabs={
                <TabContext value={currentTab}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="NFTCard">
                        <Tab label={t('plugin_collectible_about')} value={TabType.About} />
                        <Tab label={t('plugin_collectible_offers')} value={TabType.Offers} />
                        <Tab label={t('plugin_collectible_activities')} value={TabType.Activities} />
                    </MaskTabList>
                </TabContext>
            }>
            <DialogContent className={classes.dialogContent}>
                <CardDialogContent currentTab={currentTab} />
            </DialogContent>
        </InjectedDialog>
    )
}
