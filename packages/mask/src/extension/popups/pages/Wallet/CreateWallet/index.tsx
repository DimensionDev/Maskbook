import { Icons } from '@masknet/icons'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { List, ListItem, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material'
import { first, sortBy } from 'lodash-es'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hooks/index.js'
import { useWalletGroup } from '../../../hooks/useWalletGroup.js'
import { ImportCreateWallet } from '../components/ImportCreateWallet/index.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        marginBottom: theme.spacing(2),
        color: theme.palette.maskColor.second,
    },
    groups: {
        padding: 0,
        marginBottom: theme.spacing(2),
    },
    group: {
        boxShadow: theme.palette.maskColor.bottomBg,
        padding: theme.spacing(1.5),
        backdropFilter: 'blur(8px)',
        borderRadius: 8,
        cursor: 'pointer',
        '&:not(:first-of-type)': {
            marginTop: theme.spacing(2),
        },
    },
    secondaryAction: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    groupIcon: {
        marginRight: 0,
        minWidth: 'auto',
    },
    groupText: {
        margin: theme.spacing(0, 0, 0, 1),
    },
    groupName: {
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
        color: theme.palette.maskColor.main,
    },
    walletCount: {
        marginRight: theme.spacing(1),
        fontSize: 12,
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        lineHeight: '16px',
    },
}))

const CreateWallet = memo(function CreateWallet() {
    const { t } = useI18N()
    const { classes, theme } = useStyles()
    const navigate = useNavigate()

    const walletGroup = useWalletGroup()
    const groups = walletGroup?.groups ? Object.entries(walletGroup.groups) : []

    useTitle(t('popups_add_wallet'))

    return (
        <div className={classes.content}>
            {groups.length ? (
                <>
                    <Typography className={classes.sectionTitle}>
                        {t('add_new_address_to_an_existing_group')}
                    </Typography>
                    <List className={classes.groups}>
                        {groups.map(([key, wallets], index) => {
                            const theFirstWallet = first(sortBy(wallets, (w) => w.createdAt.getMilliseconds()))
                            return (
                                <ListItem
                                    classes={{ secondaryAction: classes.secondaryAction }}
                                    key={key}
                                    className={classes.group}
                                    onClick={() => {
                                        navigate(PopupRoutes.DeriveWallet, {
                                            state: {
                                                mnemonicId: key,
                                            },
                                        })
                                    }}>
                                    <ListItemIcon className={classes.groupIcon}>
                                        <Icons.MaskBlue size={24} color={theme.palette.maskColor.white} />
                                    </ListItemIcon>
                                    <ListItemText
                                        className={classes.groupText}
                                        secondary={
                                            theFirstWallet?.address ? (
                                                <Tooltip title={theFirstWallet?.address}>
                                                    <Typography component="span">
                                                        {formatEthereumAddress(theFirstWallet?.address, 4)}
                                                    </Typography>
                                                </Tooltip>
                                            ) : null
                                        }>
                                        <Typography className={classes.groupName}>
                                            {t('popups_wallet_group_title', { index: index + 1 })}
                                        </Typography>
                                    </ListItemText>
                                    <Typography className={classes.walletCount}>{wallets.length}</Typography>
                                    <Icons.ArrowRight size={20} />
                                </ListItem>
                            )
                        })}
                    </List>
                </>
            ) : null}

            <Typography className={classes.sectionTitle}>{t('or_create_a_new_wallet_group')}</Typography>
            <ImportCreateWallet />
        </div>
    )
})

export default CreateWallet
