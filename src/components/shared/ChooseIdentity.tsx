import React, { useCallback } from 'react'
import { makeStyles, Theme } from '@material-ui/core/styles'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Avatar } from '../../utils/components/Avatar'
import { Person } from '../../database'
import { List, ListSubheader, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import { PersonInList } from './SelectPeople'
import { getActivatedUI } from '../../social-network/ui'
import { useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { PersonIdentifier } from '../../database/type'

const useStyles = makeStyles((theme: Theme) => ({
    root: { width: '100%' },
    expansionRoot: { padding: '0 12px' },
    expansionContent: { margin: '6px 0' },
    list: { width: '100%' },
    current: { padding: 0 },
}))

export const ChooseIdentity: React.FC<{
    current?: Person
    availableIdentities?: Person[]
    onChangeIdentity?(person: Person): void
}> = props => {
    const classes = useStyles()
    const [expanded, setExpanded] = React.useState<boolean>(false)

    const all = useMyIdentities()
    const currentDefault =
        useCurrentIdentity() || ({ identifier: PersonIdentifier.unknown, nickname: 'Nothing' } as Person)
    const { availableIdentities = all, current = currentDefault } = props

    const handleChange = useCallback(() => {
        setExpanded(!expanded)
    }, [expanded])

    return (
        <div className={classes.root}>
            <ExpansionPanel expanded={expanded} onChange={handleChange}>
                <ExpansionPanelSummary
                    classes={{ root: classes.expansionRoot, content: classes.expansionContent }}
                    expandIcon={<ExpandMoreIcon />}>
                    <ListItem dense classes={{ gutters: classes.current }}>
                        <ListItemIcon>
                            <Avatar person={current} />
                        </ListItemIcon>
                        <ListItemText
                            primary={current.nickname || current.identifier.userId}
                            secondary="点击以切换 Maskbook 账号"
                        />
                    </ListItem>
                </ExpansionPanelSummary>
                <List subheader={<ListSubheader>切換另一個賬號</ListSubheader>} classes={{ root: classes.list }}>
                    {availableIdentities.map(person =>
                        person.identifier.equals(current.identifier) ? null : (
                            <PersonInList
                                listItemProps={{ dense: true }}
                                person={person}
                                key={person.identifier.toText()}
                                onClick={() => props.onChangeIdentity!(person)}
                            />
                        ),
                    )}
                </List>
            </ExpansionPanel>
        </div>
    )
}

ChooseIdentity.defaultProps = {
    onChangeIdentity(person) {
        getActivatedUI().currentIdentity.value = person
    },
}
