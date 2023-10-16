import { useContext } from 'react'
import { Markdown } from '@masknet/shared'
import { useProposal } from './hooks/useProposal.js'
import { SnapshotContext } from '../context.js'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    markdown: {
        '& p, & li': {
            margin: 0,
            fontSize: 14,
            color: `${theme.palette.maskColor.secondaryDark} !important`,
        },
        '& p + p': {
            marginTop: theme.spacing(0.5),
            color: `${theme.palette.maskColor.secondaryDark} !important`,
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontSize: 14,
            fontWeight: 500,
            color: `${theme.palette.maskColor.secondaryDark} !important`,
        },
        '& img': {
            maxWidth: '100%',
        },
        '& a': {
            color: `${theme.palette.maskColor.secondaryDark} !important`,
        },
        '& td, & th': {
            color: `${theme.palette.maskColor.secondaryDark} !important`,
        },
    },
}))

export function ReadMeCard() {
    const { classes } = useStyles()
    const identifier = useContext(SnapshotContext)
    const proposal = useProposal(identifier.id)

    return <Markdown className={classes.markdown}>{proposal.body}</Markdown>
}
