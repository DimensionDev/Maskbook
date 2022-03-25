import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/system'
import { ChangeEvent, useCallback, useState } from 'react'
import { Card, CardHeader, Typography, Chip, CardContent, List, ListItem, ListItemText } from '@mui/material'
import { useI18N } from '../locales/index'

const useStyles = makeStyles()((theme) => ({
    root: {
        '--contentHeight': '400px',
        '--tabHeight': '35px',

        width: '100%',
        border: `solid 1px ${theme.palette.divider}`,
        padding: 0,
    },
    content: {
        width: '100%',
        minHeight: 'var(--contentHeight)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 !important',
    },
    body: {
        flex: 1,
        maxHeight: 'calc(var(--contentHeight) - var(--tabHeight))',
        overflow: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    tabs: {
        height: 'var(--tabHeight)',
        width: '100%',
        minHeight: 'unset',
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
    },
    tab: {
        height: 'var(--tabHeight)',
        minHeight: 'unset',
        minWidth: 'unset',
    },
    subtitle: {
        fontSize: 12,
        marginRight: theme.spacing(0.5),
    },
}))
interface ENSCardProps {
    url: string
}

const ENSCard: React.FC<ENSCardProps> = (props) => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [ensName, setEnsName] = useState('')

    const handleEnsNameChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const ens_ = ev.currentTarget.value
        setEnsName(ens_)
    }, [])

    const handleSearch = useCallback(() => {
        console.log(ensName)
    }, [ensName])
    return (
        <Card className={classes.root} elevation={0}>
            <CardHeader
                title={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ marginRight: 1 }}>
                            <Typography component="span" sx={{ marginRight: 0.5 }}>
                                Etherenum Name Service
                            </Typography>
                            <Typography color="textSecondary" component="span">
                                #kkk.eth
                            </Typography>
                        </Typography>
                        <Chip color="primary" size="small" />
                    </Box>
                }
                subheader={
                    <Box display="flex" alignItems="center" sx={{ marginTop: 0.5 }}>
                        <Typography color="textSecondary" variant="body2">
                            mm
                        </Typography>
                    </Box>
                }
            />
            <CardContent className={classes.content}>
                <List>
                    <ListItem>
                        <ListItemText
                            primary={<Typography color="textPrimary">{t('parent')}</Typography>}
                            secondary="eth"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary={<Typography color="textPrimary">{t('registerant')}</Typography>}
                            secondary="0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85"
                        />
                    </ListItem>
                    {/* <ListItem>
                        <ListItemText
                            primary={<Typography color="textPrimary">Home Page</Typography>}
                            secondary={identity?.homepage}
                        />
                    </ListItem>
                    <ListItem sx={{ display: 'block' }}>
                        <ListItemText
                            primary={<Typography color="textPrimary">Avatar</Typography>}
                            secondary={identity?.avatar}
                        />
                        <Box sx={{ mt: 1 }}>
                            <img src={identity?.avatar} />
                        </Box>
                    </ListItem> */}
                </List>
            </CardContent>
        </Card>
    )
}

export default ENSCard
