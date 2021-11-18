import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from './InjectedDialog'
import { WalletStatusBox } from './WalletStatusBox'
import { ApplicationBoard, MaskAppEntry } from './ApplicationBoard'
import type { ChainId } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2, 3, 3),
        minHeight: 491,
    },
    footer: {
        fontSize: 12,
        textAlign: 'left',
        padding: theme.spacing(2),
        borderTop: `1px solid ${theme.palette.divider}`,
        justifyContent: 'flex-start',
    },
    address: {
        fontSize: 16,
        marginRight: theme.spacing(1),
        display: 'inline-block',
    },
    subTitle: {
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 600,
        marginBottom: 11.5,
        color: theme.palette.text.primary,
    },
}))

interface EntrySecondLevelDialogProps {
    title: string
    entries?: MaskAppEntry[]
    chains?: ChainId[]
    open: boolean
    closeDialog: () => void
}

export function EntrySecondLevelDialog(props: EntrySecondLevelDialogProps) {
    const { classes } = useStyles()

    return (
        <InjectedDialog title={props.title} open={props.open} onClose={props.closeDialog} maxWidth="sm">
            <DialogContent className={classes.content}>
                <WalletStatusBox />
                <ApplicationBoard secondEntries={props.entries} secondEntryChainTabs={props.chains} />
            </DialogContent>
        </InjectedDialog>
    )
}
