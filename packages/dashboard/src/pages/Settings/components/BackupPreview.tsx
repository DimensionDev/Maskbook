import type { BackupSummary } from '@masknet/backup-format'
import { Icons } from '@masknet/icons'
import { ReversedAddress } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { ChainId, explorerResolver } from '@masknet/web3-shared-evm'
import {
    Card,
    CardContent,
    CardHeader,
    Link,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material'
import { Box, type BoxProps } from '@mui/system'
import { useDashboardI18N } from '../../../locales/index.js'

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
        padding: theme.spacing(1, 2),
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
        backgroundColor: '#FFB100',
        boxShadow: '0px 6px 12px rgba(255, 177, 0, 0.2)',
    },
    list: {
        padding: 0,
    },
    walletIcon: {
        backgroundColor: '#1C68F3',
        boxShadow: '0px 6px 12px rgba(28, 104, 243, 0.2)',
    },
    wallets: {
        margin: 0,
        display: 'flex',
        flexWrap: 'wrap',
        flexFlow: 'wrap',
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
    listText: {
        fontSize: 14,
    },
    link: {
        color: theme.palette.maskColor.main,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}))

export interface BackupPreviewProps extends BoxProps {
    info: BackupSummary
}

export function BackupPreview({ info, ...rest }: BackupPreviewProps) {
    const t = useDashboardI18N()
    const { classes, theme, cx } = useStyles()

    const personas = info.personas.join(', ')

    return (
        <Box {...rest}>
            <Card className={classes.card}>
                <CardHeader
                    className={classes.cardHeader}
                    avatar={
                        <div className={cx(classes.cardIcon, classes.personaIcon)}>
                            <Icons.BaseUser size={20} color="#fff" />
                        </div>
                    }
                    classes={{ action: classes.action }}
                    title={<Typography className={classes.title}>{t.personas()}</Typography>}
                    action={
                        info.personas.length ? (
                            <Typography component="div" className={classes.headerAction}>
                                <TextOverflowTooltip title={personas} arrow placement="top">
                                    <Typography className={classes.personas}>{personas}</Typography>
                                </TextOverflowTooltip>
                                {` (${info.personas.length})`}
                            </Typography>
                        ) : null
                    }
                />
                <CardContent className={classes.cardContent}>
                    <List className={classes.list}>
                        <ListItem secondaryAction={<Typography>{info.accounts}</Typography>}>
                            <ListItemIcon className={classes.listItemIcon}>
                                <Icons.BaseUser size={20} />
                            </ListItemIcon>
                            <ListItemText className={classes.listText}>
                                {t.settings_backup_preview_associated_accounts()}
                            </ListItemText>
                        </ListItem>
                        <ListItem secondaryAction={<Typography>{info.contacts}</Typography>}>
                            <ListItemIcon className={classes.listItemIcon}>
                                <Icons.BaseContacts size={20} />
                            </ListItemIcon>
                            <ListItemText className={classes.listText}>
                                {t.settings_backup_preview_contacts()}
                            </ListItemText>
                        </ListItem>
                        <ListItem secondaryAction={<Typography>{info.contacts}</Typography>}>
                            <ListItemIcon className={classes.listItemIcon}>
                                <Icons.Folder size={20} />
                            </ListItemIcon>
                            <ListItemText className={classes.listText}>{t.settings_backup_preview_file()}</ListItemText>
                        </ListItem>
                    </List>
                </CardContent>
            </Card>
            {info.wallets.length ? (
                <Card className={classes.card}>
                    <CardHeader
                        className={classes.cardHeader}
                        avatar={
                            <div className={cx(classes.cardIcon, classes.walletIcon)}>
                                <Icons.Wallet size={20} color="#fff" />
                            </div>
                        }
                        title={
                            <Typography className={classes.title}>
                                {`${t.wallets()} (${info.wallets.length})`}
                            </Typography>
                        }
                    />
                    <CardContent className={classes.cardContent}>
                        <List className={cx(classes.wallets, classes.list)}>
                            {info.wallets.map((wallet) => (
                                <ListItem key={wallet} className={classes.wallet}>
                                    <ListItemIcon className={classes.listItemIcon}>
                                        <Icons.Wallet size={20} />
                                    </ListItemIcon>
                                    <ListItemText className={classes.listText}>
                                        <Link
                                            className={classes.link}
                                            fontSize={0}
                                            href={explorerResolver.addressLink(ChainId.Mainnet, wallet)}
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
            ) : null}
        </Box>
    )
}
