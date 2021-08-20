import {
    formatEthereumAddress,
    resolveAddressLinkOnExplorer,
    resolveIPFSLink,
    useChainId,
    formatPercentage,
} from '@masknet/web3-shared'
import { Avatar, Badge, Box, Link, List, ListItem, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import millify from 'millify'
import { useContext } from 'react'
import { useI18N, ShadowRootTooltip } from '../../../utils'
import { EthereumBlockie } from '../../../web3/UI/EthereumBlockie'
import { SnapshotContext } from '../context'
import { useRetry } from './hooks/useRetry'
import { useVotes } from './hooks/useVotes'
import { LoadingCard } from './LoadingCard'
import { LoadingFailCard } from './LoadingFailCard'
import { SnapshotCard } from './SnapshotCard'

const useStyles = makeStyles()((theme) => {
    return {
        list: {
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'var(--contentHeight)',
            overflow: 'auto',
            paddingTop: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        listItem: {
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        anchorTopRight: {
            transform: 'translateX(36px) translateY(4.5px)',
        },
        avatarWrapper: {
            marginRight: 8,
        },
        choice: {
            flexGrow: 1,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: 180,
        },
        ellipsisText: {
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
        avatar: {
            width: 16,
            height: 16,
        },
        link: {
            display: 'flex',
            width: '35%',
            color: 'inherit',
            alignItems: 'center',
            textDecoration: 'none !important',
            marginRight: 16,
        },
        shadowRootTooltip: {
            color: 'white',
        },
    }
})

function Content() {
    const chainId = useChainId()
    const identifier = useContext(SnapshotContext)
    const { payload: votes } = useVotes(identifier)
    const { classes } = useStyles()
    const { t } = useI18N()

    return (
        <SnapshotCard
            title={
                <Badge
                    max={9999999}
                    classes={{ anchorOriginTopRightRectangular: classes.anchorTopRight }}
                    badgeContent={votes.length}
                    color="primary">
                    {t('plugin_snapshot_votes_title')}
                </Badge>
            }>
            <List className={classes.list}>
                {votes.map((v) => {
                    const fullChoiceText =
                        v.totalWeight && v.choices
                            ? v.choices.reduce((acc, choice, i) => {
                                  return (
                                      acc +
                                      (i === 0 ? '' : ', ') +
                                      formatPercentage(choice.weight / v.totalWeight!) +
                                      ' ' +
                                      choice.name
                                  )
                              }, '')
                            : null
                    return (
                        <ListItem className={classes.listItem} key={v.address}>
                            <Link
                                className={classNames(classes.link, classes.ellipsisText)}
                                target="_blank"
                                rel="noopener"
                                href={resolveAddressLinkOnExplorer(chainId, v.address)}>
                                <Box className={classes.avatarWrapper}>
                                    {v.authorAvatar ? (
                                        <Avatar src={resolveIPFSLink(v.authorAvatar)} className={classes.avatar} />
                                    ) : (
                                        <EthereumBlockie address={v.address} />
                                    )}
                                </Box>
                                <Typography>{v.authorName ?? formatEthereumAddress(v.address, 4)}</Typography>
                            </Link>
                            {v.choice ? (
                                <Typography className={classes.choice}>{v.choice}</Typography>
                            ) : v.choices ? (
                                <ShadowRootTooltip
                                    PopperProps={{
                                        disablePortal: true,
                                    }}
                                    title={
                                        <Typography className={classes.shadowRootTooltip}>{fullChoiceText}</Typography>
                                    }
                                    placement="top"
                                    arrow>
                                    <Typography className={classes.choice}>{fullChoiceText}</Typography>
                                </ShadowRootTooltip>
                            ) : null}
                            <Typography>
                                {millify(v.balance, { precision: 2, lowercase: true }) +
                                    ' ' +
                                    (v.strategySymbol ? v.strategySymbol.toUpperCase() : '')}
                            </Typography>
                        </ListItem>
                    )
                })}
            </List>
        </SnapshotCard>
    )
}

function Loading(props: React.PropsWithChildren<{}>) {
    const { t } = useI18N()
    return <LoadingCard title={t('plugin_snapshot_votes_title')}>{props.children}</LoadingCard>
}

function Fail(props: React.PropsWithChildren<{}>) {
    const { t } = useI18N()
    const retry = useRetry()
    return (
        <LoadingFailCard title={t('plugin_snapshot_votes_title')} retry={retry}>
            {props.children}
        </LoadingFailCard>
    )
}

export function VotesCard() {
    return (
        <Loading>
            <Fail>
                <Content />
            </Fail>
        </Loading>
    )
}
