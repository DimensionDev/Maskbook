import { formatEthereumAddress, explorerResolver, formatPercentage } from '@masknet/web3-shared-evm'
import { Badge, Box, Link, List, ListItem, Typography } from '@mui/material'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import classNames from 'classnames'
import millify from 'millify'
import { useContext } from 'react'
import { useI18N } from '../../../utils'
import { EthereumBlockie } from '../../../web3/UI/EthereumBlockie'
import { SnapshotContext } from '../context'
import { useRetry } from './hooks/useRetry'
import { useVotes } from './hooks/useVotes'
import { LoadingCard } from './LoadingCard'
import { LoadingFailCard } from './LoadingFailCard'
import { SnapshotCard } from './SnapshotCard'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

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
        badge: {
            transform: 'translateX(40px) translateY(2.5px)',
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
            minWidth: 130,
            color: 'inherit',
            alignItems: 'center',
            textDecoration: 'none !important',
            marginRight: 16,
        },
        power: {
            minWidth: 90,
        },
        shadowRootTooltip: {
            color: 'white',
        },
    }
})

function Content() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const identifier = useContext(SnapshotContext)
    const { payload: votes } = useVotes(identifier)
    const { classes } = useStyles()
    const { t } = useI18N()

    return (
        <SnapshotCard
            title={
                <Badge max={9999999} classes={{ badge: classes.badge }} badgeContent={votes.length} color="primary">
                    {t('plugin_snapshot_votes_title')}
                </Badge>
            }>
            <List className={classes.list}>
                {votes.map((v) => {
                    const isAverageWeight = v.choices?.every((c) => c.weight === 1)
                    const fullChoiceText =
                        v.totalWeight && v.choices
                            ? v.choices
                                  .flatMap((choice, index) => [
                                      index === 0 ? '' : ', ',
                                      !isAverageWeight ? formatPercentage(choice.weight / v.totalWeight!) + ' ' : '',
                                      choice.name,
                                  ])
                                  .join('')
                            : null
                    return (
                        <ListItem className={classes.listItem} key={v.address}>
                            <Link
                                className={classNames(classes.link, classes.ellipsisText)}
                                target="_blank"
                                rel="noopener"
                                href={explorerResolver.addressLink(chainId, v.address)}>
                                <Box className={classes.avatarWrapper}>
                                    <EthereumBlockie address={v.address} />
                                </Box>
                                <Typography>{formatEthereumAddress(v.address, 4)}</Typography>
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
                            <Typography className={classes.power}>
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
