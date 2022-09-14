import { useEffect, useState } from 'react'
import {
    PluginIDContextProvider,
    PluginWeb3ContextProvider,
    useChainIdValid,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { InjectedDialog } from '@masknet/shared'
import { MaskTabList, useTabs } from '@masknet/theme'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { NFTCardContent } from './NFTCardContent.js'
import { useStyles } from '../useStyles.js'
import { useI18N } from '../../../utils/index.js'

export enum NFTCardDialogTabs {
    About = 'About',
    Offers = 'Offers',
    Activity = 'Activity',
}

export function NFTCardDialog() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [tokenId, setTokenId] = useState('')
    const [tokenAddress, setTokenAddress] = useState('')
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll | undefined>()
    const [pluginID, setPluginID] = useState<NetworkPluginID | undefined>()
    const chainIdValid = useChainIdValid(pluginID)
    const [open, setOpen] = useState(false)

    const [currentTab, onChange] = useTabs<NFTCardDialogTabs>(
        NFTCardDialogTabs.About,
        NFTCardDialogTabs.Offers,
        NFTCardDialogTabs.Activity,
    )

    useEffect(() => {
        if (!chainIdValid) setOpen(false)
        return CrossIsolationMessages.events.requestNFTCardDialog.on((ev) => {
            if (!ev.open) return
            if (ev.pluginID) setPluginID(ev.pluginID)
            if (ev.chainId) setChainId(ev.chainId)
            setTokenAddress(ev.address)
            setTokenId(ev.tokenId)
            setOpen(ev.open)
        })
    }, [chainIdValid])

    console.log('DEBUG: card dialog')
    console.log({
        chainId,
        tokenId,
        tokenAddress,
    })

    if (!chainId || !pluginID) return null

    return (
        <PluginIDContextProvider value={pluginID}>
            <PluginWeb3ContextProvider
                pluginID={pluginID}
                value={{
                    chainId,
                }}>
                <TabContext value={currentTab}>
                    <InjectedDialog
                        open={open}
                        title={t('plugin_collectible_nft_detail')}
                        onClose={() => setOpen(false)}
                        classes={{ paper: classes.dialogRoot }}
                        titleTabs={
                            <MaskTabList variant="base" onChange={onChange} aria-label="NFTCard">
                                <Tab label="About" value={NFTCardDialogTabs.About} />
                                <Tab label="Offers" value={NFTCardDialogTabs.Offers} />
                                <Tab label="Activity" value={NFTCardDialogTabs.Activity} />
                            </MaskTabList>
                        }>
                        <DialogContent className={classes.dialogContent}>
                            <NFTCardContent tokenId={tokenId} tokenAddress={tokenAddress} currentTab={currentTab} />
                        </DialogContent>
                    </InjectedDialog>
                </TabContext>
            </PluginWeb3ContextProvider>
        </PluginIDContextProvider>
    )
}
