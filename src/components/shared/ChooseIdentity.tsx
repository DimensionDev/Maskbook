import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Avatar } from '../../utils/components/Avatar'
import { Profile } from '../../database'
import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core'
import { PersonOrGroupInList, PersonOrGroupInListProps } from './SelectPeopleAndGroups'
import { getActivatedUI } from '../../social-network/ui'
import { useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { PersonIdentifier } from '../../database/type'
import { geti18nString } from '../../utils/i18n'
import { currentSelectedIdentity } from '../../components/shared-settings/settings'
import { useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles({
    root: { width: '100%' },
    expansionRoot: { padding: '0 12px' },
    expansionContent: { margin: '6px 0' },
    list: { width: '100%' },
    currentSelected: { padding: 0 },
})
export interface ChooseIdentityProps
    extends withClasses<KeysInferFromUseStyles<typeof useStyles, 'expansionContent' | 'expansionRoot'>> {
    /**
     * Current selected identity
     * @defaultValue the global selected identity
     */
    current?: Profile
    /** All available identities
     * @defaultValue `useMyIdentities()`
     */
    availableIdentities?: Profile[]
    /** When user change the identity
     *  @defaultValue will change the global selected identity
     */
    onChangeIdentity?(person: Profile): void
    PersonOrGroupInListProps?: PersonOrGroupInListProps
}
/**
 * Choose the current using identity.
 */
export const ChooseIdentity: React.FC<ChooseIdentityProps> = props => {
    const classes = useStylesExtends(useStyles(), props)
    const [expanded, setExpanded] = React.useState<boolean>(false)

    const all = useMyIdentities()
    const currentDefault =
        useCurrentIdentity() || ({ identifier: PersonIdentifier.unknown, nickname: 'Nothing' } as Profile)
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
                    <ListItem dense classes={{ gutters: classes.currentSelected }}>
                        <ListItemIcon>
                            <Avatar person={current} />
                        </ListItemIcon>
                        <ListItemText
                            primary={current.nickname || current.identifier.userId}
                            secondary={geti18nString('shared_choose_identity_title')}
                        />
                    </ListItem>
                </ExpansionPanelSummary>
                <List
                    subheader={<ListSubheader>{geti18nString('shared_choose_identity_subtitle')}</ListSubheader>}
                    classes={{ root: classes.list }}>
                    {availableIdentities.map(person =>
                        person.identifier.equals(current.identifier) ? null : (
                            <PersonOrGroupInList
                                ListItemProps={{ dense: true }}
                                item={person}
                                key={person.identifier.toText()}
                                onClick={() => {
                                    props.onChangeIdentity!(person)
                                    setExpanded(false)
                                }}
                                {...props.PersonOrGroupInListProps}
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
        const ui = getActivatedUI()
        ui.currentIdentity.value = person
        currentSelectedIdentity[ui.networkIdentifier].value = person.identifier.toText()
    },
}
/**
 * This hook allows use <ChooseIdentity /> in a isolated scope without providing
 * verbose information.
 */
export function useIsolatedChooseIdentity(): readonly [Profile | null, React.ReactNode] {
    const all = useMyIdentities()
    const whoami = useCurrentIdentity()
    const [current, set] = useState<Profile>()
    const selected = current || whoami || undefined
    return [
        selected || null,
        <ChooseIdentity current={selected} availableIdentities={all} onChangeIdentity={set} />,
    ] as const
}
