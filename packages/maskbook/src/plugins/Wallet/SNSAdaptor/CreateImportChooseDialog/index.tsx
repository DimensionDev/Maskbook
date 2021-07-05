import { Box, Button, DialogContent, makeStyles, Typography } from '@material-ui/core'
import { Image } from '../../../../components/shared/Image'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useI18N } from '../../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../messages'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(5, 4.5),
        display: 'block',
    },
    walletOption: {
        display: 'flex',
        alignItems: 'center',
        padding: 20,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 12,
        backgroundColor: theme.palette.background.paper,
        '& + &': {
            marginTop: 20,
        },
    },
    optionTexts: {
        marginRight: 'auto',
        marginLeft: theme.spacing(2),
    },
    button: {
        width: 90,
        flexShirnk: 0,
        borderRadius: 30,
    },
    optionName: {
        fontSize: 16,
        fontWeight: 500,
    },
    optionDescription: {
        fontSize: 12,
        color: '#7B8192',
        width: 218,
    },
    optionIcon: {
        height: 48,
        width: 48,
    },
}))

interface WalletCreationChooseUIProps {
    onCreateClick: () => void
    onImportClick: () => void
}

export function WalletCreationChooseUI(props: WalletCreationChooseUIProps) {
    const { t } = useI18N()
    const classes = useStyles()

    return (
        <>
            <Box className={classes.walletOption}>
                <Image
                    src={new URL('./wallet.png', import.meta.url).toString()}
                    height={48}
                    width={48}
                    className={classes.optionIcon}
                />
                <Box className={classes.optionTexts}>
                    <Typography variant="h2" component="h2" className={classes.optionName}>
                        {t('plugin_wallet_create_a_new_wallet')}
                    </Typography>
                    <Typography variant="body1" className={classes.optionDescription}>
                        {t('plugin_wallet_create_a_new_wallet_description')}
                    </Typography>
                </Box>
                <Button className={classes.button} variant="contained" size="small" onClick={props.onCreateClick}>
                    {t('plugin_wallet_setup_create')}
                </Button>
            </Box>
            <Box className={classes.walletOption}>
                <Image
                    src={new URL('./import.png', import.meta.url).toString()}
                    height={48}
                    width={48}
                    className={classes.optionIcon}
                />
                <Box className={classes.optionTexts}>
                    <Typography variant="h2" component="h2" className={classes.optionName}>
                        {t('plugin_wallet_import_wallet')}
                    </Typography>
                    <Typography variant="body1" className={classes.optionDescription}>
                        {t('plugin_wallet_import_wallet_description')}
                    </Typography>
                </Box>
                <Button className={classes.button} variant="contained" size="small" onClick={props.onImportClick}>
                    {t('plugin_wallet_setup_import')}
                </Button>
            </Box>
        </>
    )
}

export function CreateImportChooseDialog() {
    const { t } = useI18N()
    const classes = useStyles()

    //#region remote controlled dialog logic
    const { openDialog: openCreateWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.createWalletDialogUpdated,
    )
    //#endregion

    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.createImportWalletDialogUpdated)
    const { openDialog: openImportDialog } = useRemoteControlledDialog(WalletMessages.events.importWalletDialogUpdated)

    const toCreateWallet = () => {
        openCreateWalletDialog()
        closeDialog()
    }

    const toImportWallet = () => {
        openImportDialog()
        closeDialog()
    }

    return (
        <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_wallet_create_import_choose')} maxWidth="sm">
            <DialogContent className={classes.content}>
                <WalletCreationChooseUI onCreateClick={toCreateWallet} onImportClick={toImportWallet} />
            </DialogContent>
        </InjectedDialog>
    )
}
