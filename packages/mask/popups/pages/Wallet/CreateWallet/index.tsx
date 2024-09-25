import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { first, sortBy } from 'lodash-es'
import { List, ListItem, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { useTitle } from '../../../hooks/index.js'
import { useWalletGroup } from '../../../hooks/useWalletGroup.js'
import { ImportCreateWallet } from '../components/ImportCreateWallet/index.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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

export const Component = memo(function CreateWallet() {
    const { _ } = useLingui()
    const { classes, theme } = useStyles()
    const navigate = useNavigate()

    const walletGroup = useWalletGroup()
    const groups = walletGroup?.groups ? Object.entries(walletGroup.groups) : []

    useTitle(_(msg`Add Wallet`))

    return (
        <div className={classes.content}>
            {groups.length ?
                <>
                    <Typography className={classes.sectionTitle}>
                        <Trans>Add new address to an existing group</Trans>
                    </Typography>
                    <List className={classes.groups}>
                        {groups.map(([key, wallets], index) => {
                            const theFirstWallet = first(sortBy(wallets, (w) => w.createdAt.getTime()))
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
                                            theFirstWallet?.address ?
                                                <Tooltip title={theFirstWallet.address}>
                                                    <Typography component="span">
                                                        {formatEthereumAddress(theFirstWallet.address, 4)}
                                                    </Typography>
                                                </Tooltip>
                                            :   null
                                        }>
                                        <Typography className={classes.groupName}>
                                            <Trans>Wallet Group #{String(index + 1)}</Trans>
                                        </Typography>
                                    </ListItemText>
                                    <Typography className={classes.walletCount}>{wallets.length}</Typography>
                                    <Icons.ArrowRight size={20} />
                                </ListItem>
                            )
                        })}
                    </List>
                </>
            :   null}

            <Typography className={classes.sectionTitle}>
                <Trans>Or create a new wallet group</Trans>
            </Typography>
            <ImportCreateWallet />
        </div>
    )
})
