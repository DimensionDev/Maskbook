import { InjectedDialog } from '@masknet/shared'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { NetworkPluginID } from '@masknet/shared-base'
import { CardDialogContent } from './CardDialogContent.js'
import { TabType } from '../../types.js'
import { Context } from '../Context/index.js'
import { useCollectibleTrans } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    dialogRoot: {
        width: 800,
        height: 800,
        maxWidth: 800,
    },
    dialogContent: {
        width: '100%',
        background: theme.palette.maskColor.bottom,
        padding: 0,
        height: '100%',
        overflow: 'hidden',
    },
}))

interface CardDialogProps {
    open: boolean
    setOpen: (opened: boolean) => void
}

export function CardDialog(props: CardDialogProps) {
    const t = useCollectibleTrans()
    const { classes } = useStyles()
    const { chainId, pluginID, tokenId, tokenAddress } = Context.useContainer()

    const [currentTab, onChange] = useTabs(TabType.About, TabType.Activities)

    if (!chainId || !pluginID) return null

    if (pluginID === NetworkPluginID.PLUGIN_EVM) {
        if (!tokenAddress || !tokenId) return null
    }

    if (pluginID === NetworkPluginID.PLUGIN_SOLANA) {
        if (!tokenAddress) return null
    }

    return (
        <InjectedDialog
            open={props.open}
            title={t.plugin_collectible_nft_details()}
            onClose={() => props.setOpen(false)}
            classes={{ paper: classes.dialogRoot }}
            titleTabs={
                <TabContext value={currentTab}>
                    <MaskTabList variant="base" onChange={onChange} aria-label="NFTCard">
                        <Tab label={t.plugin_collectible_about()} value={TabType.About} />
                        <Tab label={t.plugin_collectible_activities()} value={TabType.Activities} />
                    </MaskTabList>
                </TabContext>
            }>
            <DialogContent className={classes.dialogContent}>
                <CardDialogContent open={props.open} setOpen={props.setOpen} currentTab={currentTab} />
            </DialogContent>
        </InjectedDialog>
    )
}
