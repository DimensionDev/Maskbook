import type { BackupSummary } from '@masknet/backup-format'
import { Icons } from '@masknet/icons'
import { ReversedAddress } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { ChainId } from '@masknet/web3-shared-evm'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import {
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Link,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material'
import { Box, type BoxProps } from '@mui/system'
import { memo } from 'react'
import { Plural, Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    card: {
        backgroundColor: theme.palette.maskColor.bottom,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.maskColor.line}`,
        borderRadius: 8,
        marginBottom: theme.spacing(2),
    },
    cardHeader: {
        padding: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.maskColor.line}`,
    },
    title: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 700,
    },
    cardContent: {
        padding: theme.spacing(1, 0),
        '&:last-child': {
            paddingBottom: theme.spacing(1),
        },
    },
    action: {
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'center',
        marginRight: 0,
    },
    headerAction: {
        display: 'flex',
        height: theme.spacing(4.5),
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 700,
        whiteSpace: 'nowrap',
    },
    personas: {
        maxWidth: 200,
        overflow: 'hidden',
        fontWeight: 700,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    cardIcon: {
        height: 36,
        width: 36,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    personaIcon: {
        color: theme.palette.maskColor.white,
        backgroundColor: '#FFB100',
        boxShadow: '0px 6px 12px rgba(255, 177, 0, 0.2)',
    },
    list: {
        padding: 0,
    },
    walletHeaderIcon: {
        backgroundColor: '#1C68F3',
        boxShadow: '0px 6px 12px rgba(28, 104, 243, 0.2)',
    },
    wallets: {
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
    },
    wallet: {
        width: 'auto',
        flexWrap: 'nowrap',
    },
    listItemIcon: {
        marginRight: theme.spacing(1),
        width: theme.spacing(4.5),
        color: theme.palette.maskColor.second,
        minWidth: 'unset',
    },
    walletIcon: {
        marginRight: theme.spacing(1),
        color: theme.palette.maskColor.second,
        minWidth: 'unset',
    },
    listText: {
        fontSize: 14,
    },
    link: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
}))

interface PersonasBackupPreviewProps {
    info: BackupSummary
    selectable?: boolean
    selected?: boolean
    onChange?: (selected: boolean) => void
}

export const PersonasBackupPreview = memo<PersonasBackupPreviewProps>(function PersonasBackupPreview({
    info,
    selectable,
    selected,
    onChange,
}) {
    const { classes, cx } = useStyles()

    const personas = info.personas.join(', ')

    return (
        <Card className={classes.card}>
            <CardHeader
                className={classes.cardHeader}
                avatar={
                    <div className={cx(classes.cardIcon, classes.personaIcon)}>
                        <Icons.BaseUser size={20} />
                    </div>
                }
                classes={{ action: classes.action }}
                title={
                    <Typography className={classes.title}>
                        <Trans>Personas</Trans>
                    </Typography>
                }
                action={
                    info.personas.length ?
                        <Box display="flex" columnGap={1}>
                            <Typography component="div" className={classes.headerAction}>
                                <TextOverflowTooltip title={personas} arrow placement="top">
                                    <Typography className={classes.personas}>{personas}</Typography>
                                </TextOverflowTooltip>
                                {` (${info.personas.length})`}
                            </Typography>
                            {selectable ?
                                <Checkbox checked={selected} onChange={(event) => onChange?.(event.target.checked)} />
                            :   null}
                        </Box>
                    :   null
                }
            />
            <CardContent className={classes.cardContent}>
                <List className={classes.list}>
                    <ListItem secondaryAction={<Typography>{info.accounts}</Typography>}>
                        <ListItemIcon className={classes.listItemIcon}>
                            <Icons.BaseUser size={20} />
                        </ListItemIcon>
                        <ListItemText className={classes.listText}>
                            <Trans>Associated Accounts</Trans>
                        </ListItemText>
                    </ListItem>
                    <ListItem secondaryAction={<Typography>{info.contacts}</Typography>}>
                        <ListItemIcon className={classes.listItemIcon}>
                            <Icons.BaseContacts size={20} />
                        </ListItemIcon>
                        <ListItemText className={classes.listText}>
                            <Trans>Contacts</Trans>
                        </ListItemText>
                    </ListItem>
                    <ListItem secondaryAction={<Typography>{info.files}</Typography>}>
                        <ListItemIcon className={classes.listItemIcon}>
                            <Icons.Folder size={20} />
                        </ListItemIcon>
                        <ListItemText className={classes.listText}>
                            <Trans>File</Trans>
                        </ListItemText>
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    )
})

interface WalletsBackupPreviewProps {
    wallets: string[]
    selectable?: boolean
    selected?: boolean
    onChange?: (selected: boolean) => void
}

export const WalletsBackupPreview = memo<WalletsBackupPreviewProps>(function WalletsBackupPreview({
    wallets,
    selectable,
    selected,
    onChange,
}) {
    const { classes, theme, cx } = useStyles()

    if (!wallets.length) return null
    const walletLength = wallets.length
    return (
        <Card className={classes.card}>
            <CardHeader
                className={classes.cardHeader}
                avatar={
                    <div className={cx(classes.cardIcon, classes.walletHeaderIcon)}>
                        <Icons.Wallet size={20} color="#fff" />
                    </div>
                }
                title={
                    <Typography className={classes.title}>
                        <Plural value={walletLength} one="# Wallet" other="# Wallets" />
                    </Typography>
                }
                action={
                    selectable ?
                        <Checkbox checked={selected} onChange={(event) => onChange?.(event.target.checked)} />
                    :   null
                }
            />
            <CardContent className={classes.cardContent}>
                <List className={cx(classes.wallets, classes.list)} sx={{ px: 0 }}>
                    {wallets.map((wallet) => (
                        <ListItem key={wallet} className={classes.wallet}>
                            <ListItemIcon className={classes.walletIcon}>
                                <Icons.Wallet size={20} />
                            </ListItemIcon>
                            <ListItemText className={classes.listText}>
                                <Link
                                    className={classes.link}
                                    fontSize={0}
                                    href={EVMExplorerResolver.addressLink(ChainId.Mainnet, wallet)}
                                    target="_blank">
                                    <ReversedAddress
                                        component="span"
                                        pluginID={NetworkPluginID.PLUGIN_EVM}
                                        address={wallet}
                                        mr="10px"
                                    />
                                    <Icons.LinkOut size={18} color={theme.palette.maskColor.second} />
                                </Link>
                            </ListItemText>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    )
})
interface BackupPreviewProps extends BoxProps {
    info: BackupSummary
}

export function BackupPreview({ info, ...rest }: BackupPreviewProps) {
    return (
        <Box {...rest}>
            <PersonasBackupPreview info={info} />
            <WalletsBackupPreview wallets={info.wallets} />
        </Box>
    )
}
