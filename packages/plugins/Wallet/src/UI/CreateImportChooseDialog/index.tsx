import { Box, Button, makeStyles, Typography } from '@material-ui/core'
import { useI18N } from '../../locales'

const useStyles = makeStyles((theme) => ({
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

export interface WalletCreationChooseUIProps {
    onCreateClick: () => void
    onImportClick: () => void
}

export function WalletCreationChooseUI(props: WalletCreationChooseUIProps) {
    const { onCreateClick, onImportClick } = props
    const t = useI18N()
    const classes = useStyles()

    return (
        <>
            <Box className={classes.walletOption}>
                <img
                    src={new URL('./wallet.png', import.meta.url).toString()}
                    height={48}
                    width={48}
                    className={classes.optionIcon}
                />
                <Box className={classes.optionTexts}>
                    <Typography variant="h2" component="h2" className={classes.optionName}>
                        {t.create_a_new_wallet()}
                    </Typography>
                    <Typography variant="body1" className={classes.optionDescription}>
                        {t.create_a_new_wallet_description()}
                    </Typography>
                </Box>
                <Button className={classes.button} variant="contained" size="small" onClick={onCreateClick}>
                    {t.wallet_setup_create()}
                </Button>
            </Box>
            <Box className={classes.walletOption}>
                <img
                    src={new URL('./import.png', import.meta.url).toString()}
                    height={48}
                    width={48}
                    className={classes.optionIcon}
                />
                <Box className={classes.optionTexts}>
                    <Typography variant="h2" component="h2" className={classes.optionName}>
                        {t.import_wallet()}
                    </Typography>
                    <Typography variant="body1" className={classes.optionDescription}>
                        {t.import_wallet_description()}
                    </Typography>
                </Box>
                <Button className={classes.button} variant="contained" size="small" onClick={onImportClick}>
                    {t.wallet_setup_import()}
                </Button>
            </Box>
        </>
    )
}
