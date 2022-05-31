import { formatEthereumAddress, explorerResolver, resolveIPFSLink } from '@masknet/web3-shared-evm'
import { Avatar, Box, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import OpenInNew from '@mui/icons-material/OpenInNew'
import formatDateTime from 'date-fns/format'
import { useContext } from 'react'
import { TokenIcon } from '@masknet/shared'
import { useI18N } from '../../../utils'
import { EthereumBlockie } from '../../../web3/UI/EthereumBlockie'
import { SnapshotContext } from '../context'
import { useProposal } from './hooks/useProposal'
import { SnapshotCard } from './SnapshotCard'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export interface InformationCardProps {}

export interface InfoFieldProps {
    title: string
    children: React.ReactNode
}

const useStyles = makeStyles()((theme) => {
    return {
        field: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: `${theme.spacing(1)} auto`,
        },
        link: {
            display: 'flex',
            color: 'inherit',
            alignItems: 'center',
            marginLeft: theme.spacing(1),
            textDecoration: 'none !important',
        },
        avatar: {
            width: 16,
            height: 16,
        },
        avatarWrapper: {
            marginRight: 8,
        },
    }
})

export function InfoField(props: InfoFieldProps) {
    const { classes } = useStyles()
    return (
        <div className={classes.field}>
            <div>
                <Typography>{props.title}</Typography>
            </div>
            <div>{props.children}</div>
        </div>
    )
}

export function InformationCard(props: InformationCardProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    const identifier = useContext(SnapshotContext)
    const { payload: proposal } = useProposal(identifier.id)

    const { start, end, snapshot, strategies } = proposal
    return (
        <SnapshotCard title={t('plugin_snapshot_info_title')}>
            <Typography component="div">
                <InfoField title={t('plugin_snapshot_info_strategy')}>
                    <Box sx={{ display: 'flex' }}>
                        {strategies
                            .filter((strategy) => Boolean(strategy.params.address))
                            .map((strategy, i) => (
                                <Link
                                    key={i}
                                    className={classes.link}
                                    target="_blank"
                                    rel="noopener"
                                    href={explorerResolver.addressLink(chainId, strategy.params.address)}>
                                    <TokenIcon address={strategy.params.address} />
                                </Link>
                            ))}
                    </Box>
                </InfoField>
                <InfoField title={t('plugin_snapshot_info_author')}>
                    <Link
                        className={classes.link}
                        target="_blank"
                        rel="noopener"
                        href={explorerResolver.addressLink(chainId, proposal.address)}>
                        <div className={classes.avatarWrapper}>
                            {proposal.authorAvatar ? (
                                <Avatar src={resolveIPFSLink(proposal.authorAvatar)} className={classes.avatar} />
                            ) : (
                                <EthereumBlockie address={proposal.address} />
                            )}
                        </div>
                        {proposal.authorName ?? formatEthereumAddress(proposal.address, 4)}
                    </Link>
                </InfoField>
                <InfoField title={t('plugin_snapshot_info_ipfs')}>
                    <Link className={classes.link} target="_blank" rel="noopener" href={resolveIPFSLink(identifier.id)}>
                        #{identifier.id.slice(0, 7)}
                        <OpenInNew fontSize="small" />
                    </Link>
                </InfoField>
                <InfoField title={t('plugin_snapshot_info_start')}>
                    {formatDateTime(start * 1000, 'MM/dd/yyyy')}
                </InfoField>
                <InfoField title={t('plugin_snapshot_info_end')}>{formatDateTime(end * 1000, 'MM/dd/yyyy')}</InfoField>
                <InfoField title={t('plugin_snapshot_info_snapshot')}>
                    <Link
                        className={classes.link}
                        target="_blank"
                        rel="noopener"
                        href={explorerResolver.blockLink(chainId, Number.parseInt(snapshot, 10))}>
                        {snapshot}
                        <OpenInNew fontSize="small" />
                    </Link>
                </InfoField>
            </Typography>
        </SnapshotCard>
    )
}
