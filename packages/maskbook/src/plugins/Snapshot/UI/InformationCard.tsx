import { useContext } from 'react'
import { Box, Link, makeStyles, Typography, Avatar } from '@material-ui/core'
import { format } from 'date-fns'
import OpenInNew from '@material-ui/icons/OpenInNew'

import { useI18N } from '../../../utils/i18n-next-ui'
import { SnapshotCard } from './SnapshotCard'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'
import { EthereumBlockie } from '../../../web3/UI/EthereumBlockie'
import { resolveAddressLinkOnEtherscan, resolveBlockLinkOnEtherscan, resolveIPFSLink } from '../../../web3/pipes'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import { useChainId } from '../../../web3/hooks/useBlockNumber'

import { SnapshotContext } from '../context'
import { useProposal } from '../hooks/useProposal'

export interface InformationCardProps {}

export interface InfoFieldProps {
    title: string
    children: React.ReactNode
}

const useStyles = makeStyles((theme) => {
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
    const classes = useStyles()

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
    const classes = useStyles()
    const { t } = useI18N()
    const chainId = useChainId()

    const identifier = useContext(SnapshotContext)
    const {
        payload: { proposal, message },
    } = useProposal(identifier.id)

    const { start, end, snapshot } = message.payload

    return (
        <SnapshotCard title={t('plugin_snapshot_info_title')}>
            <Typography component="div">
                <InfoField title={t('plugin_snapshot_info_strategy')}>
                    <Box sx={{ display: 'flex' }}>
                        {message.payload.metadata.strategies.map((strategy, i) => (
                            <Link
                                key={i.toString()}
                                className={classes.link}
                                target="_blank"
                                rel="noopener"
                                href={resolveAddressLinkOnEtherscan(chainId, strategy.params.address)}>
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
                        href={resolveAddressLinkOnEtherscan(chainId, proposal.address)}>
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
                    {format(new Date(start * 1000), 'MM/dd/yyyy')}
                </InfoField>
                <InfoField title={t('plugin_snapshot_info_end')}>
                    {format(new Date(end * 1000), 'MM/dd/yyyy')}
                </InfoField>
                <InfoField title={t('plugin_snapshot_info_snapshot')}>
                    <Link
                        className={classes.link}
                        target="_blank"
                        rel="noopener"
                        href={resolveBlockLinkOnEtherscan(chainId, snapshot)}>
                        {snapshot}
                        <OpenInNew fontSize="small" />
                    </Link>
                </InfoField>
            </Typography>
        </SnapshotCard>
    )
}
