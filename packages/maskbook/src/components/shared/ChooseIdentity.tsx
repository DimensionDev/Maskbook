import { useCallback, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import type { Profile } from '../../database'
import { List, Accordion, AccordionSummary } from '@material-ui/core'
import { ProfileInList } from './SelectProfileUI'
import { activatedSocialNetworkUI } from '../../social-network'
import { useCurrentIdentity } from '../DataSource/useActivatedUI'
import { ProfileIdentifier } from '../../database/type'
import { currentSelectedIdentity } from '../../settings/settings'
import { useStylesExtends } from '@masknet/shared'

const useStyles = makeStyles()({
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

const useAccordionSummaryStyle = makeStyles()({
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
    /** All available identities
     * @defaultValue `useMyIdentities()`
     */
    identities: readonly Profile[]
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
                    <ProfileInList
                        item={current}
                        ListItemProps={{ dense: true, classes: { root: classes.listItemRoot } }}
                    />
                </AccordionSummary>
                {identities.length ? (
                    <List classes={{ root: classes.list }}>
                        {identities.map((profile) =>
                            profile.identifier.equals(current.identifier) ? null : (
                                <ProfileInList
                                    key={profile.identifier.toText()}
                                    item={profile}
                                    ListItemProps={{ dense: true, classes: { root: classes.listItemRoot } }}
                                    onClick={() => {
                                        setExpanded(false)
                                        currentSelectedIdentity[ui.networkIdentifier].value =
                                            profile.identifier.toText()
                                    }}
                                />
                            ),
                        )}
                    </List>
                ) : null}
            </Accordion>
        </div>
    )
}
