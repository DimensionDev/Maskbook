import { Avatar, Box, makeStyles } from '@material-ui/core'
import { useBlockie } from '../../../web3/hooks/useBlockie'
import type { VoteItem as VoteType } from '../types'

const useStlyes = makeStyles(() => ({
    avatar: {
        width: 16,
        height: 16,
    },
}))

export interface VoteProps {
    vote: VoteType
}

export function Vote(props: VoteProps) {
    const classes = useStlyes()
    const blockie = useBlockie(props.vote.address)

    return (
        <Box display="flex" alignItems="center">
            <Avatar className={classes.avatar} src={blockie} />
        </Box>
    )
}
