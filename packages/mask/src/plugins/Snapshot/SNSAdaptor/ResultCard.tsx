import { useContext, useRef, useEffect, useState, useMemo } from 'react'
import { Box, List, ListItem, Typography, LinearProgress, styled, Button, linearProgressClasses } from '@mui/material'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { useI18N } from '../../../utils/index.js'
import millify from 'millify'
import { SnapshotContext } from '../context.js'
import { useProposal } from './hooks/useProposal.js'
import { useVotes } from './hooks/useVotes.js'
import { useResults } from './hooks/useResults.js'
import { SnapshotCard } from './SnapshotCard.js'
import { parse } from 'json2csv'
import { useRetry } from './hooks/useRetry.js'
import { LoadingFailCard } from './LoadingFailCard.js'
import { LoadingCard } from './LoadingCard.js'

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
            paddingLeft: 0,
            paddingRight: 0,
        },
        listItemHeader: {
            display: 'flex',
            width: '100%',
        },
        power: {
            marginLeft: theme.spacing(2),
            color: theme.palette.maskColor.publicMain,
        },
        ratio: {
            marginLeft: 'auto',
            color: theme.palette.maskColor.publicMain,
        },
        choice: {
            maxWidth: choiceMaxWidth,
            color: theme.palette.maskColor.publicMain,
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
            backgroundColor: theme.palette.maskColor.publicMain,
            color: theme.palette.maskColor.white,
            '&:hover': {
                backgroundColor: theme.palette.maskColor.publicMain,
                color: theme.palette.maskColor.white,
            },
        },
        tooltip: {
            backgroundColor: theme.palette.maskColor.publicMain,
            color: theme.palette.maskColor.white,
        },
        arrow: {
            color: theme.palette.maskColor.publicMain,
        },
    }
})

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
    [`&.${linearProgressClasses.root}`]: {
        height: 8,
        borderRadius: 5,
        backgroundColor: theme.palette.maskColor.publicBg,
    },
    [`&.${linearProgressClasses.bar}`]: {
        borderRadius: 5,
    },
}))

function Content() {
    const identifier = useContext(SnapshotContext)
    const { payload: proposal } = useProposal(identifier.id)
    const { payload: votes } = useVotes(identifier)
    const {
        payload: { results },
    } = useResults(identifier)
    const { classes, cx } = useStyles()
    const { t } = useI18N()
    const listRef = useRef<HTMLSpanElement[]>([])
    const [tooltipsVisible, setTooltipsVisible] = useState<readonly boolean[]>(
        Array.from<boolean>({ length: results.length }).fill(false),
    )

    useEffect(() => {
        setTooltipsVisible(listRef.current.map((element) => element.offsetWidth === choiceMaxWidth))
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
                    <ListItem className={classes.listItem} key={i}>
                        <Box className={classes.listItemHeader}>
                            <ShadowRootTooltip
                                PopperProps={{
                                    disablePortal: true,
                                }}
                                title={<Typography>{result.choice}</Typography>}
                                placement="top"
                                disableHoverListener={!tooltipsVisible[i]}
                                classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                arrow>
                                <Typography
                                    ref={(ref) => {
                                        listRef.current[i] = ref!
                                    }}
                                    className={cx(classes.choice, classes.ellipsisText)}>
                                    {result.choice}
                                </Typography>
                            </ShadowRootTooltip>
                            <ShadowRootTooltip
                                PopperProps={{
                                    disablePortal: true,
                                }}
                                classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                title={
                                    <Typography className={classes.ellipsisText}>
                                        {result.powerDetail
                                            .flatMap((detail, index) => {
                                                const name = millify(detail.power, {
                                                    precision: 2,
                                                    lowercase: true,
                                                })
                                                return [index === 0 ? '' : '+', name, detail.name]
                                            })
                                            .join(' ')}
                                    </Typography>
                                }
                                placement="top"
                                arrow>
                                <Typography className={classes.power}>
                                    {millify(result.power, { precision: 2, lowercase: true })}
                                </Typography>
                            </ShadowRootTooltip>
                            <Typography className={classes.ratio}>
                                {Number.parseFloat(result.percentage.toFixed(2))}%
                            </Typography>
                        </Box>
                        <Box className={classes.linearProgressWrap}>
                            <StyledLinearProgress color="inherit" variant="determinate" value={result.percentage} />
                        </Box>
                    </ListItem>
                ))}
            </List>
            {proposal.isEnd ? (
                <Button
                    variant="roundedContained"
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
    const { payload: proposal } = useProposal(identifier.id)
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
    const { payload: proposal } = useProposal(identifier.id)
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
