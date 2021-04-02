import {
    Card,
    createStyles,
    makeStyles,
    CardContent,
    CardHeader,
    Box,
    List,
    ListItem,
    Typography,
    LinearProgress,
} from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { ProposalIdentifier, ProposalMessage, Proposal, Vote } from '../types'
import snapshot from '@zhouhancheng/snapshot.js'

export interface ResultCardProps {
    identifier: ProposalIdentifier
    message: ProposalMessage
    proposal: Proposal
    votes: {
        [x: string]: Vote
    }
}

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            margin: '16px auto',
            width: '80%',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 0,
            minHeight: 320,
        },
        content: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 !important',
        },
        header: {
            backgroundColor: theme.palette.mode === 'dark' ? '#24292e' : 'white',
            borderBottom: `1px solid ${theme.palette.divider}`,
            padding: '12px 16px',
        },
        title: {
            paddingLeft: theme.spacing(1),
            fontSize: 20,
        },
        list: {
            display: 'flex',
            flexDirection: 'column',
        },
        listItem: {
            display: 'flex',
            flexDirection: 'column',
        },
        listItemHeader: {
            display: 'flex',
            width: '100%',
        },
        power: {
            marginLeft: theme.spacing(2),
        },
        ratio: {
            marginLeft: 'auto',
        },
        choice: {
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            width: '60%',
        },
        linearProgressWrap: {
            width: '100%',
            marginTop: theme.spacing(1),
        },
    })
})

export function ResultCard(props: ResultCardProps) {
    const { identifier, message, proposal, votes } = props
    const classes = useStyles()
    const { t } = useI18N()
    const results = [
        {
            choice: 'Increase AAVE cap to Uncapped',
            ratio: 70,
            power: 859.63,
        },
        {
            choice: 'Keep AAVE cap at $100M',
            ratio: 20,
            power: 231.62,
        },
        {
            choice: 'Decrease AAVE cap to $30M',
            ratio: 10,
            power: 1.5,
        },
    ]
    message.payload.metadata.strategies.map((strategy) => {
        console.log(snapshot.strategies[strategy.name])
    })
    console.log('snapshot', snapshot)
    return (
        <Card className={classes.root} elevation={0}>
            <CardHeader
                className={classes.header}
                title={<Box className={classes.title}>{t('plugin_snapshot_result_title')}</Box>}></CardHeader>
            <CardContent className={classes.content}>
                <List className={classes.list}>
                    {results.map((result) => (
                        <ListItem className={classes.listItem}>
                            <Box className={classes.listItemHeader}>
                                <Typography className={classes.choice}>{result.choice}</Typography>
                                <Typography className={classes.power}>{result.power}</Typography>
                                <Typography className={classes.ratio}>{result.ratio}%</Typography>
                            </Box>
                            <Box className={classes.linearProgressWrap}>
                                <LinearProgress variant="determinate" value={result.ratio} />
                            </Box>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    )
}
