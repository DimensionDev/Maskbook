import { useContext, useMemo, unstable_useCacheRefresh } from 'react'
import { Box, List, ListItem, Typography, LinearProgress, styled, Button, linearProgressClasses } from '@mui/material'
import { makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'

import { SnapshotContext } from '../context.js'
import { useProposal } from './hooks/useProposal.js'
import { useVotes } from './hooks/useVotes.js'
import { useResults } from './hooks/useResults.js'
import { SnapshotCard } from './SnapshotCard.js'
// cspell: disable-next-line
import { Parser } from '@json2csv/plainjs'
import { LoadingFailCard } from './LoadingFailCard.js'
import { formatCount } from '@masknet/web3-shared-base'
import { LoadingCard } from './LoadingCard.js'
import { isArray } from 'lodash-es'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Trans } from '@lingui/macro'

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
    const proposal = useProposal(identifier.id)
    const votes = useVotes(identifier)
    const { results } = useResults(identifier, proposal)
    const { classes, cx } = useStyles()

    const dataForCsv = useMemo(() => {
        if (!isArray(votes)) return EMPTY_LIST
        return votes.map((vote) => ({
            address: vote.address,
            choice: vote.choiceIndex,
            balance: vote.balance,
            timestamp: vote.timestamp,
            dateUtc: new Date(vote.timestamp * 1000).toUTCString(),
            authorIpfsHash: vote.authorIpfsHash,
        }))
    }, [votes])

    return (
        <SnapshotCard title={proposal.isEnd ? <Trans>Results</Trans> : <Trans>Current results</Trans>}>
            <List className={classes.list}>
                {results ?
                    results.map((result, i) => (
                        <ListItem className={classes.listItem} key={i}>
                            <Box className={classes.listItemHeader}>
                                <TextOverflowTooltip
                                    as={ShadowRootTooltip}
                                    PopperProps={{
                                        disablePortal: true,
                                    }}
                                    title={<Typography>{result.choice}</Typography>}
                                    placement="top"
                                    classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                    arrow>
                                    <Typography className={cx(classes.choice, classes.ellipsisText)}>
                                        {result.choice}
                                    </Typography>
                                </TextOverflowTooltip>
                                <ShadowRootTooltip
                                    PopperProps={{
                                        disablePortal: true,
                                    }}
                                    classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                    title={
                                        <Typography className={classes.ellipsisText}>
                                            {result.powerDetail
                                                .filter((x) => x.power)
                                                .flatMap((detail, index) => {
                                                    const name = formatCount(
                                                        proposal.scores_by_strategy[i][index],
                                                        2,
                                                        true,
                                                    )
                                                    return [index === 0 ? '' : '+', name, detail.name]
                                                })
                                                .join(' ')}
                                        </Typography>
                                    }
                                    placement="top"
                                    arrow>
                                    <Typography className={classes.power}>
                                        {formatCount(proposal.scores[i], 2, true)}
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
                    ))
                :   null}
            </List>
            {proposal.isEnd ?
                <Button
                    variant="roundedContained"
                    className={classes.resultButton}
                    onClick={() => {
                        const parser = new Parser()
                        const csv = parser.parse(dataForCsv)
                        const link = document.createElement('a')
                        // TODO: use URL.createObjectURL instead
                        link.setAttribute('href', `data:text/csv;charset=utf-8,${csv}`)
                        link.setAttribute('download', `snapshot-report-${identifier.id}.csv`)
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                    }}>
                    <Trans>Download report</Trans>
                </Button>
            :   null}
        </SnapshotCard>
    )
}

function Loading(props: React.PropsWithChildren) {
    const identifier = useContext(SnapshotContext)
    const proposal = useProposal(identifier.id)
    return (
        <LoadingCard title={proposal.isEnd ? <Trans>Results</Trans> : <Trans>Current results</Trans>}>
            {props.children}
        </LoadingCard>
    )
}

function Fail(props: React.PropsWithChildren) {
    const identifier = useContext(SnapshotContext)
    const retry = unstable_useCacheRefresh()
    const proposal = useProposal(identifier.id)
    return (
        <LoadingFailCard title={proposal.isEnd ? <Trans>Results</Trans> : <Trans>Current results</Trans>} retry={retry}>
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
