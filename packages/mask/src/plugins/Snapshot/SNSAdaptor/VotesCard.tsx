import { unstable_useCacheRefresh, useContext } from 'react'
import { millify } from 'millify'
import { formatEthereumAddress, explorerResolver, formatPercentage } from '@masknet/web3-shared-evm'
import { Badge, Box, Link, List, ListItem, Typography } from '@mui/material'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useI18N } from '../../../utils/index.js'
import { EthereumBlockie } from '@masknet/shared'
import { SnapshotContext } from '../context.js'
import { useVotes } from './hooks/useVotes.js'
import { LoadingCard } from './LoadingCard.js'
import { LoadingFailCard } from './LoadingFailCard.js'
import { SnapshotCard } from './SnapshotCard.js'

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
            borderBottom: `1px solid ${theme.palette.maskColor.publicLine}`,
            paddingLeft: 0,
            paddingRight: 0,
            gap: 16,
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
            maxWidth: 170,
            color: theme.palette.maskColor.publicMain,
        },
        ellipsisText: {
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
        link: {
            display: 'flex',
            minWidth: 130,
            color: 'inherit',
            alignItems: 'center',
            textDecoration: 'none !important',
        },
        power: {
            minWidth: 90,
            color: theme.palette.maskColor.publicMain,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            maxWidth: 90,
        },
        shadowRootTooltip: {
            color: theme.palette.maskColor.white,
        },
        tooltip: {
            backgroundColor: theme.palette.maskColor.publicMain,
            color: 'white',
        },
        arrow: {
            color: theme.palette.maskColor.publicMain,
        },
    }
})

function Content() {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const identifier = useContext(SnapshotContext)
    const votes = useVotes(identifier)
    const { classes, cx, theme } = useStyles()
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
                                className={cx(classes.link, classes.ellipsisText)}
                                target="_blank"
                                rel="noopener"
                                href={explorerResolver.addressLink(chainId, v.address)}>
                                <Box className={classes.avatarWrapper}>
                                    <EthereumBlockie address={v.address} />
                                </Box>
                                <Typography color={theme.palette.maskColor.dark}>
                                    {formatEthereumAddress(v.address, 4)}
                                </Typography>
                            </Link>
                            {v.choice ? (
                                <Typography className={classes.choice}>{v.choice}</Typography>
                            ) : v.choices ? (
                                <ShadowRootTooltip
                                    PopperProps={{
                                        disablePortal: false,
                                    }}
                                    title={
                                        <Typography className={classes.shadowRootTooltip}>{fullChoiceText}</Typography>
                                    }
                                    placement="top"
                                    classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                    arrow>
                                    <Typography className={classes.choice}>{fullChoiceText}</Typography>
                                </ShadowRootTooltip>
                            ) : null}
                            <ShadowRootTooltip
                                PopperProps={{
                                    disablePortal: true,
                                }}
                                classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                title={
                                    <Typography className={classes.shadowRootTooltip}>
                                        {millify(v.balance, { precision: 2, lowercase: true }) +
                                            ' ' +
                                            (v.strategySymbol ? v.strategySymbol.toUpperCase() : '')}
                                    </Typography>
                                }
                                placement="top"
                                arrow>
                                <Typography className={classes.power}>
                                    {millify(v.balance, { precision: 2, lowercase: true }) +
                                        ' ' +
                                        (v.strategySymbol ? v.strategySymbol.toUpperCase() : '')}
                                </Typography>
                            </ShadowRootTooltip>
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
    const retry = unstable_useCacheRefresh()
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
