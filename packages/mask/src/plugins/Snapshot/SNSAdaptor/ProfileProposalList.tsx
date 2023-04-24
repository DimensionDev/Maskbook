import { List, ListItem, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { SnapshotProposal } from '@masknet/web3-providers/types'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { EthereumBlockie } from '@masknet/shared'
import { startCase } from 'lodash-es'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
        listItem: { width: '100%' },
        author: { display: 'flex' },
    }
})

export interface ProfileProposalListProps {
    proposalList: SnapshotProposal[]
}

export function ProfileProposalList(props: ProfileProposalListProps) {
    const { proposalList } = props
    const { classes } = useStyles(undefined)
    const { Others } = useWeb3State()
    return (
        <List className={classes.root}>
            {proposalList.map((x, i) => {
                return (
                    <ListItem key={i} className={classes.listItem}>
                        <section className={classes.header}>
                            <div className={classes.author}>
                                <EthereumBlockie address={x.author} />
                                <Typography>{Others?.formatAddress(x.author, 4)}</Typography>
                            </div>
                            <div>{startCase(x.state)}</div>
                        </section>
                    </ListItem>
                )
            })}
        </List>
    )
}
