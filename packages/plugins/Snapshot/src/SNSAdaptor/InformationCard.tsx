import { formatEthereumAddress, explorerResolver } from '@masknet/web3-shared-evm'
import { Avatar, Box, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { OpenInNew } from '@mui/icons-material'
import formatDateTime from 'date-fns/format'
import { useContext } from 'react'
import { EthereumBlockie } from '@masknet/shared'
import { SnapshotContext } from '../context.js'
import { useProposal } from './hooks/useProposal.js'
import { SnapshotCard } from './SnapshotCard.js'
import { resolveIPFS_URL, resolveResourceURL } from '@masknet/web3-shared-base'
import urlcat from 'urlcat'
import { SNAPSHOT_IPFS } from '../constants.js'
import { useI18N } from '../locales/index.js'

export interface InformationCardProps {}

export interface InfoFieldProps extends withClasses<'field'> {
    title: string
    children: React.ReactNode
}

const useStyles = makeStyles()((theme) => {
    return {
        field: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 14,
            color: theme.palette.maskColor.main,
            width: '100%',
        },
        title: {
            fontWeight: 400,
        },
        link: {
            display: 'flex',
            color: 'inherit',
            alignItems: 'center',
            marginLeft: theme.spacing(1),
            textDecoration: 'none !important',
            fontSize: 14,
            fontWeight: 400,
        },
        avatar: {
            width: 16,
            height: 16,
        },
        avatarWrapper: {
            marginRight: 8,
        },
        info: {
            marginTop: 0,
            color: theme.palette.maskColor.publicMain,
        },
        infoColor: {
            color: theme.palette.maskColor.publicMain,
        },
    }
})

export function InfoField(props: InfoFieldProps) {
    const { classes } = useStyles(undefined, { props })
    return (
        <div className={classes.field}>
            <Typography className={classes.title}>{props.title}</Typography>
            <div>{props.children}</div>
        </div>
    )
}

export function InformationCard(props: InformationCardProps) {
    const { classes } = useStyles()
    const t = useI18N()
    const identifier = useContext(SnapshotContext)
    const proposal = useProposal(identifier.id)
    const { start, end, snapshot, strategies, chainId } = proposal
    return (
        <SnapshotCard title={t.plugin_snapshot_info_title()}>
            <InfoField title={t.plugin_snapshot_info_strategy()} classes={{ field: classes.info }}>
                <Box sx={{ display: 'flex' }}>
                    {strategies
                        .filter((strategy) => !!strategy.params.address)
                        .map((strategy, i) => (
                            <Link
                                key={i}
                                className={classes.link}
                                target="_blank"
                                rel="noopener"
                                href={explorerResolver.addressLink(chainId, strategy.params.address)}>
                                <Avatar src={resolveIPFS_URL(proposal.space.avatar)} className={classes.avatar} />
                            </Link>
                        ))}
                </Box>
            </InfoField>
            <InfoField title={t.plugin_snapshot_info_author()} classes={{ field: classes.infoColor }}>
                <Link
                    className={classes.link}
                    target="_blank"
                    rel="noopener"
                    href={explorerResolver.addressLink(proposal.chainId, proposal.address)}>
                    <div className={classes.avatarWrapper}>
                        {proposal.authorAvatar ? (
                            <Avatar src={resolveIPFS_URL(proposal.authorAvatar)} className={classes.avatar} />
                        ) : (
                            <EthereumBlockie address={proposal.address} />
                        )}
                    </div>
                    <Typography fontSize={14}>
                        {proposal.space.id ?? formatEthereumAddress(proposal.address, 4)}
                    </Typography>
                </Link>
            </InfoField>
            <InfoField title={t.plugin_snapshot_info_ipfs()} classes={{ field: classes.infoColor }}>
                <Link
                    className={classes.link}
                    target="_blank"
                    rel="noopener"
                    href={resolveResourceURL(urlcat(SNAPSHOT_IPFS, proposal.ipfs))}>
                    <Typography fontSize={14}>#{identifier.id.slice(0, 7)}</Typography>
                    <OpenInNew fontSize="small" sx={{ paddingLeft: 1 }} />
                </Link>
            </InfoField>
            <InfoField title={t.plugin_snapshot_info_start()} classes={{ field: classes.infoColor }}>
                <Typography fontSize={14} fontWeight={400}>
                    {formatDateTime(start * 1000, 'MMM dd, yyyy, hh:mm a')}
                </Typography>
            </InfoField>
            <InfoField title={t.plugin_snapshot_info_end()} classes={{ field: classes.infoColor }}>
                <Typography fontSize={14} fontWeight={400}>
                    {formatDateTime(end * 1000, 'MMM dd, yyyy, hh:mm a')}
                </Typography>
            </InfoField>
            <InfoField title={t.plugin_snapshot_info_snapshot()} classes={{ field: classes.infoColor }}>
                <Link
                    className={classes.link}
                    target="_blank"
                    rel="noopener"
                    href={explorerResolver.blockLink(proposal.chainId, Number.parseInt(snapshot, 10))}>
                    <Typography fontSize={14}>{snapshot}</Typography>
                    <OpenInNew fontSize="small" sx={{ paddingLeft: 1 }} />
                </Link>
            </InfoField>
        </SnapshotCard>
    )
}
