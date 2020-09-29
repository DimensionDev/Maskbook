import React from 'react'
import {
    makeStyles,
    createStyles,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core'
import { format } from 'date-fns'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../../components/InjectedComponents/DialogDismissIcon'
import type { PollMetaData } from '../types'

const useStyles = makeStyles(() =>
    createStyles({
        content: {
            paddingBottom: '20px',
            paddingTop: '0px',
        },
    }),
)

interface VotingHistoryProps
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'container'
        | 'backdrop'
        | 'close'
        | 'header'
        | 'content'
        | 'paper'
    > {
    poll: PollMetaData
    open: boolean
    onDecline: () => void
}

export default function VotingHistory(props: VotingHistoryProps) {
    const { poll } = props
    const { voting_history, options } = poll
    const classes = useStylesExtends(useStyles(), props)

    return (
        <>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
                open={props.open}
                scroll="paper"
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                BackdropProps={{
                    className: classes.backdrop,
                }}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={props.onDecline}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography style={{ marginLeft: '6px' }} display="inline" variant="inherit">
                        Voting History
                    </Typography>
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <List>
                        {voting_history && voting_history.length !== 0 ? (
                            voting_history.map((item, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={item.voter_name}
                                        secondary={
                                            <React.Fragment>
                                                <Typography component="span" variant="body2" color="textPrimary">
                                                    {`Vote For Option ${item.option_index + 1}: "${
                                                        options[item.option_index]
                                                    }" — `}
                                                </Typography>
                                                <Typography component="span" variant="body2" color="textSecondary">
                                                    {format(item.voting_time, 'MM/dd/yyyy')}
                                                </Typography>
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                            ))
                        ) : (
                            <Typography variant="body2" color="textPrimary">
                                No Vote.
                            </Typography>
                        )}
                    </List>
                </DialogContent>
            </ShadowRootDialog>
        </>
    )
}
