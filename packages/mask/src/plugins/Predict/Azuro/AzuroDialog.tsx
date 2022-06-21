import { FolderTabPanel, FolderTabs, makeStyles } from '@masknet/theme'
import { Card, CardContent, DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../locales'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { isDashboardPage } from '@masknet/shared-base'
import { MyBetsView } from './views/MyBetsView'
import { EventsView } from './views/EventsView'

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
}))

export interface AzuroDialogProps {
    open: boolean
    onClose?: () => void
}

export function AzuroDialog(props: AzuroDialogProps) {
    const { open, onClose } = props
    const t = useI18N()
    const { classes } = useStyles()
    const isDashboard = isDashboardPage()

    return (
        <Card className={classes.root}>
            <CardContent className={classes.content}>
                <InjectedDialog open={open} title={t.plugin_azuro()} onClose={onClose}>
                    <DialogContent>
                        {!isDashboard ? (
                            <div className={classes.walletStatusBox}>
                                <WalletStatusBox />
                            </div>
                        ) : null}
                        <div className={classes.container}>
                            <FolderTabs>
                                <FolderTabPanel label={t.plugin_events()}>
                                    <EventsView />
                                </FolderTabPanel>
                                <FolderTabPanel label={t.plugin_bets()}>
                                    <MyBetsView />
                                </FolderTabPanel>
                            </FolderTabs>
                        </div>
                    </DialogContent>
                </InjectedDialog>
            </CardContent>
        </Card>
    )
}
