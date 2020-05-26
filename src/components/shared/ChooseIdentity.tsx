import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Avatar } from '../../utils/components/Avatar'
import type { Profile } from '../../database'
import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core'
import { PersonOrGroupInList, PersonOrGroupInListProps } from './SelectPeopleAndGroups'
import { getActivatedUI } from '../../social-network/ui'
import { useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { ProfileIdentifier } from '../../database/type'
import { useI18N } from '../../utils/i18n-next-ui'
import { currentSelectedIdentity } from '../../components/shared-settings/settings'
import { useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles({
    root: { width: '100%', lineHeight: 1.75 },
    expansionPanelRoot: { boxShadow: 'none', width: '100%' },
    expansionPanelSummaryRoot: { padding: 0 },
    expansionPanelSummaryContent: { width: '100%', margin: 0 },
    list: { width: '100%' },
    listItemRoot: { padding: '12px 8px' },
    fingerprint: { textOverflow: 'ellipsis', overflow: 'hidden', fontSize: 12 },
})
export interface ChooseIdentityProps
    extends withClasses<
        KeysInferFromUseStyles<typeof useStyles, 'expansionPanelSummaryContent' | 'expansionPanelSummaryRoot'>
    > {
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
export const ChooseIdentity: React.FC<ChooseIdentityProps> = (props) => {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const [expanded, setExpanded] = React.useState<boolean>(false)

    const all = useMyIdentities()
    const currentDefault =
        useCurrentIdentity() || ({ identifier: ProfileIdentifier.unknown, nickname: 'Nothing' } as Profile)
    const { availableIdentities = all, current = currentDefault } = props

    const handleChange = useCallback(() => {
        if (availableIdentities.length > 1) setExpanded(!expanded)
    }, [availableIdentities.length, expanded])

    return (
        <div className={classes.root}>
            <ExpansionPanel classes={{ root: classes.expansionPanelRoot }} expanded={expanded} onChange={handleChange}>
                <ExpansionPanelSummary
                    classes={{ root: classes.expansionPanelSummaryRoot, content: classes.expansionPanelSummaryContent }}
                    expandIcon={availableIdentities.length > 1 ? <ExpandMoreIcon /> : null}>
                    <PersonOrGroupInList
                        ListItemProps={{ dense: true }}
                        item={current}
                        {...props.PersonOrGroupInListProps}></PersonOrGroupInList>
                </ExpansionPanelSummary>
                {availableIdentities.length ? (
                    <List classes={{ root: classes.list }}>
                        {availableIdentities.map((person) =>
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
                ) : null}
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
