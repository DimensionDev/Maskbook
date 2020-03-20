import React, { useMemo } from 'react'
import DashboardRouterContainer from './Container'
import { TextField, InputAdornment, Typography } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import SearchIcon from '@material-ui/icons/Search'
import { useFriendsList } from '../../../components/DataSource/useActivatedUI'
import { ContactLine } from '../DashboardComponents/ContactLine'

const useStyles = makeStyles(theme =>
    createStyles({
        title: {
            margin: theme.spacing(3, 0),
        },
    }),
)

export default function DashboardContactsRouter() {
    const actions = useMemo(
        () => [
            <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />,
        ],
        [],
    )

    const classes = useStyles()
    const contacts = useFriendsList()

    return (
        <DashboardRouterContainer title="Contacts" actions={actions}>
            <Typography className={classes.title} variant="body2" color="textSecondary">
                All people recorded in the Maskbook database.
            </Typography>
            <section>
                {contacts.map(contact => (
                    <ContactLine key={contact.identifier.toText()} contact={contact}></ContactLine>
                ))}
            </section>
        </DashboardRouterContainer>
    )
}
