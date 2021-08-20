import { useContext, useRef, useEffect, useState, useMemo } from 'react'
import classNames from 'classnames'
import { Box, List, ListItem, Typography, LinearProgress, withStyles, Button } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { ShadowRootTooltip, useI18N } from '../../../utils'
import millify from 'millify'
import { SnapshotContext } from '../context'
import { useProposal } from './hooks/useProposal'
import { useVotes } from './hooks/useVotes'
import { useResults } from './hooks/useResults'
import { SnapshotCard } from './SnapshotCard'
import { parse } from 'json2csv'
import { useRetry } from './hooks/useRetry'
import { LoadingFailCard } from './LoadingFailCard'
import { LoadingCard } from './LoadingCard'

const choiceMaxWidth = 240

const useStyles = makeStyles()((theme) => {
    return {
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
            maxWidth: choiceMaxWidth,
        },
        linearProgressWrap: {
            width: '100%',
            marginTop: theme.spacing(1),
        },
        ellipsisText: {
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
        resultButton: {
            width: 200,
            margin: '0 auto',
        },
    }
})

const StyledLinearProgress = withStyles({
    root: {
        height: 8,
        borderRadius: 5,
    },
    bar: {
        borderRadius: 5,
    },
})(LinearProgress)

function Content() {
    const identifier = useContext(SnapshotContext)
    const {
        payload: { proposal },
    } = useProposal(identifier.id)
    const { payload: votes } = useVotes(identifier)
    const {
        payload: { results },
    } = useResults(identifier)
    const { classes } = useStyles()
    const { t } = useI18N()
    const listRef = useRef<HTMLSpanElement[]>([])
    const [tooltipsVisible, setTooltipsVisible] = useState<readonly boolean[]>(
        Array.from<boolean>({ length: results.length }).fill(false),
    )

    useEffect(() => {
        setTooltipsVisible(listRef.current.map((element) => (element.offsetWidth === choiceMaxWidth ? true : false)))
    }, [])

    const dataForCsv = useMemo(
        () =>
            votes.map((vote) => ({
                address: vote.address,
                choice: vote.choiceIndex,
                balance: vote.balance,
                timestamp: vote.timestamp,
                dateUtc: new Date(vote.timestamp * 1000).toUTCString(),
                authorIpfsHash: vote.authorIpfsHash,
            })),
        [votes],
    )

    return (
        <SnapshotCard
            title={proposal.isEnd ? t('plugin_snapshot_result_title') : t('plugin_snapshot_current_result_title')}>
            <List className={classes.list}>
                {results.map((result, i) => (
                    <ListItem className={classes.listItem} key={i.toString()}>
                        <Box className={classes.listItemHeader}>
                            <ShadowRootTooltip
                                PopperProps={{
                                    disablePortal: true,
                                }}
                                title={<Typography color="textPrimary">{result.choice}</Typography>}
                                placement="top"
                                disableHoverListener={!tooltipsVisible[i]}
                                arrow>
                                <Typography
                                    ref={(ref) => {
                                        listRef.current[i] = ref!
                                    }}
                                    className={classNames(classes.choice, classes.ellipsisText)}>
                                    {result.choice}
                                </Typography>
                            </ShadowRootTooltip>
                            <ShadowRootTooltip
                                PopperProps={{
                                    disablePortal: true,
                                }}
                                title={
                                    <Typography color="textPrimary" className={classes.ellipsisText}>
                                        {result.powerDetail.reduce((sum, cur, i) => {
                                            const name =
                                                millify(cur.power, { precision: 2, lowercase: true }) + ' ' + cur.name
                                            return `${sum} ${i === 0 ? '' : '+'} ${name}`
                                        }, '')}
                                    </Typography>
                                }
                                placement="top"
                                arrow>
                                <Typography className={classes.power}>
                                    {millify(result.power, { precision: 2, lowercase: true })}
                                </Typography>
                            </ShadowRootTooltip>
                            <Typography className={classes.ratio}>
                                {parseFloat(result.percentage.toFixed(2))}%
                            </Typography>
                        </Box>
                        <Box className={classes.linearProgressWrap}>
                            <StyledLinearProgress variant="determinate" value={result.percentage} />
                        </Box>
                    </ListItem>
                ))}
            </List>
            {proposal.isEnd ? (
                <Button
                    color="primary"
                    variant="outlined"
                    className={classes.resultButton}
                    onClick={() => {
                        const csv = parse(dataForCsv)
                        const link = document.createElement('a')
                        link.setAttribute('href', `data:text/csv;charset=utf-8,${csv}`)
                        link.setAttribute('download', `snapshot-report-${identifier.id}.csv`)
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                    }}>
                    {t('plugin_snapshot_download_report')}
                </Button>
            ) : null}
        </SnapshotCard>
    )
}

function Loading(props: React.PropsWithChildren<{}>) {
    const { t } = useI18N()
    const identifier = useContext(SnapshotContext)
    const {
        payload: { proposal },
    } = useProposal(identifier.id)
    return (
        <LoadingCard
            title={proposal.isEnd ? t('plugin_snapshot_result_title') : t('plugin_snapshot_current_result_title')}>
            {props.children}
        </LoadingCard>
    )
}

function Fail(props: React.PropsWithChildren<{}>) {
    const { t } = useI18N()
    const identifier = useContext(SnapshotContext)
    const {
        payload: { proposal },
    } = useProposal(identifier.id)
    const retry = useRetry()
    return (
        <LoadingFailCard
            title={proposal.isEnd ? t('plugin_snapshot_result_title') : t('plugin_snapshot_current_result_title')}
            retry={retry}>
            {props.children}
        </LoadingFailCard>
    )
}

export function ResultCard() {
    return (
        <Loading>
            <Fail>
                <Content />
            </Fail>
        </Loading>
    )
}
