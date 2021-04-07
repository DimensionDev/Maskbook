import { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import type { Profile } from '../../database'
import { List, Accordion, AccordionSummary } from '@material-ui/core'
import { ProfileOrGroupInList, ProfileOrGroupInListProps } from './SelectPeopleAndGroups'
import { activatedSocialNetworkUI } from '../../social-network'
import { useCurrentIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import { ProfileIdentifier } from '../../database/type'
import { currentSelectedIdentity } from '../../settings/settings'
import { useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles({
    root: {
        width: '100%',
        lineHeight: 1.75,
    },
    expansionPanelRoot: {
        boxShadow: 'none',
        width: '100%',
    },
    list: {
        width: '100%',
        padding: 0,
    },
    listItemRoot: {
        padding: '6px 24px 6px 8px',
    },
    fingerprint: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontSize: 12,
    },
})

const useAccordionSummaryStyle = makeStyles({
    root: {
        padding: 0,
    },
    content: {
        width: '100%',
        margin: 0,
    },
    expanded: {
        margin: '0 !important',
        minHeight: 'unset !important',
    },
    expandIcon: {
        padding: 0,
        marginRight: '0 !important',
        right: 4,
        position: 'absolute',
        pointerEvents: 'none',
    },
})

export interface ChooseIdentityProps extends withClasses<never> {
    /**
     * Current selected identity
     * @defaultValue the global selected identity
     */
    current?: Profile
    /** All available identities
     * @defaultValue `useMyIdentities()`
     */
    identities: readonly Profile[]
    /** When user change the identity
     *  @defaultValue will change the global selected identity
     */
    onChangeIdentity?(person: Profile): void
    PersonOrGroupInListProps?: ProfileOrGroupInListProps
}
/**
 * Choose the current using identity.
 */
export function ChooseIdentity(props: ChooseIdentityProps) {
    const { identities } = props

    const classes = useStylesExtends(useStyles(), props)
    const expansionPanelSummaryClasses = useStylesExtends(useAccordionSummaryStyle(), props)
    const [expanded, setExpanded] = useState(false)

    const ui = activatedSocialNetworkUI
    const current = useCurrentIdentity() || ({ identifier: ProfileIdentifier.unknown, nickname: 'Nothing' } as Profile)

    const onChange = useCallback(() => {
        if (identities.length > 1) setExpanded(!expanded)
    }, [identities.length, expanded])

    return (
        <div className={classes.root}>
            <Accordion classes={{ root: classes.expansionPanelRoot }} expanded={expanded} onChange={onChange}>
                <AccordionSummary
                    classes={expansionPanelSummaryClasses}
                    expandIcon={identities.length > 1 ? <ExpandMoreIcon /> : null}>
                    <ProfileOrGroupInList
                        item={current}
                        ListItemProps={{ dense: true, classes: { root: classes.listItemRoot } }}
                        {...props.PersonOrGroupInListProps}
                    />
                </AccordionSummary>
                {identities.length ? (
                    <List classes={{ root: classes.list }}>
                        {identities.map((person) =>
                            person.identifier.equals(current.identifier) ? null : (
                                <ProfileOrGroupInList
                                    key={person.identifier.toText()}
                                    item={person}
                                    ListItemProps={{ dense: true, classes: { root: classes.listItemRoot } }}
                                    onClick={() => {
                                        setExpanded(false)
                                        currentSelectedIdentity[ui.networkIdentifier].value = person.identifier.toText()
                                    }}
                                    {...props.PersonOrGroupInListProps}
                                />
                            ),
                        )}
                    </List>
                ) : null}
            </Accordion>
        </div>
    )
}

/**
 * This hook allows use <ChooseIdentity /> in a isolated scope without providing
 * verbose information.
 */
export function useIsolatedChooseIdentity(): readonly [Profile | null, React.ReactNode] {
    const all = useMyIdentities()
    const whoami = useCurrentIdentity()
    const [current, setCurrent] = useState<Profile>()
    const selected = current || whoami || undefined
    return [
        selected || null,
        <ChooseIdentity current={selected} identities={all} onChangeIdentity={setCurrent} />,
    ] as const
}
