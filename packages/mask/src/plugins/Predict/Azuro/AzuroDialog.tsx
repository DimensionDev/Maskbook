import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { Card, CardContent, DialogActions, DialogContent, Tab } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../locales'
import { MyBetsView } from './views/MyBetsView'
import { EventsView } from './views/EventsView'
import { TabContext, TabPanel } from '@mui/lab'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import { PluginWalletStatusBar } from '../../../utils'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useState } from 'react'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useChainId } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,-apple-system,system-ui,"sans-serif"',
        width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
    },
    content: {
        width: '100%',
        height: 'var(--contentHeight)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        padding: '0 !important',
    },
    walletStatusBox: { margin: theme.spacing(1, 1, 3, 1) },
    container: { padding: theme.spacing(1) },
    tabPanel: { padding: theme.spacing(1, 0, 0, 0) },
    dialogActions: { padding: 0, position: 'sticky', bottom: 0 },
}))

export interface AzuroDialogProps {
    open: boolean
    onClose?: () => void
}

export function AzuroDialog(props: AzuroDialogProps) {
    const { open, onClose } = props
    const t = useI18N()
    const { classes } = useStyles()
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [chainId, setChainId] = useState<ChainId>(currentChainId)

    const eventsLabel = t.plugin_events()
    const myBetsLabel = t.plugin_bets()

    const [currentTab, onChange, tabs] = useTabs(eventsLabel, myBetsLabel)

    return (
        <Card className={classes.root}>
            <CardContent className={classes.content}>
                <TabContext value={currentTab}>
                    <InjectedDialog
                        open={open}
                        title={t.plugin_azuro()}
                        onClose={onClose}
                        titleTabs={
                            <MaskTabList variant="base" onChange={onChange} aria-label={t.plugin_azuro()}>
                                <Tab label={tabs[eventsLabel]} value={tabs[eventsLabel]} />
                                <Tab label={tabs[myBetsLabel]} value={tabs[myBetsLabel]} />
                            </MaskTabList>
                        }>
                        <DialogContent>
                            <TabPanel className={classes.content} value={tabs[eventsLabel]}>
                                <EventsView />
                            </TabPanel>
                            <TabPanel className={classes.content} value={tabs[myBetsLabel]}>
                                <MyBetsView />
                            </TabPanel>
                        </DialogContent>
                        <DialogActions className={classes.dialogActions}>
                            <PluginWalletStatusBar>
                                <ChainBoundary
                                    expectedChainId={chainId}
                                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                                />
                            </PluginWalletStatusBar>
                        </DialogActions>
                    </InjectedDialog>
                </TabContext>
            </CardContent>
        </Card>
    )
}
