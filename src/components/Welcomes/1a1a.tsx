import * as React from 'react'
import { useState } from 'react'
import { geti18nString } from '../../utils/i18n'
import { Button, makeStyles, Typography, Theme } from '@material-ui/core'
import WelcomeContainer from './WelcomeContainer'
import { SelectPeopleAndGroupsUI, isGroup } from '../shared/SelectPeopleAndGroups'
import { Person } from '../../database'

interface Props {
    next(person: Person): void
    linkNewSocialNetworks(): void
    identities: Person[]
}
const useStyles = makeStyles<Theme>(theme => ({
    paper: {
        textAlign: 'center',
        '& > *:not(:last-child)': {
            marginBottom: theme.spacing(3),
        },
    },
    button: {
        minWidth: 180,
    },
    select: {
        padding: '0 4em',
    },
}))
export default function Welcome({ next, identities, linkNewSocialNetworks }: Props) {
    const classes = useStyles()
    const [selected, setSelect] = useState<Person | null>(identities[0] || null)
    return (
        <WelcomeContainer className={classes.paper}>
            <Typography variant="h5">{geti18nString('welcome_1a1_title')}</Typography>
            <SelectPeopleAndGroupsUI<Person>
                classes={{ root: classes.select }}
                hideSelectAll
                hideSelectNone
                showAtNetwork
                maxSelection={1}
                items={identities}
                selected={[]}
                frozenSelected={[selected!].filter(x => x)}
                onSetSelected={list => setSelect(list[0])}
            />
            <Button
                disabled={selected === null}
                onClick={() => next(selected!)}
                variant="contained"
                color="primary"
                className={classes.button}>
                {geti18nString('welcome_1a1_next')}
            </Button>
            <br />
            <Button onClick={linkNewSocialNetworks} color="primary">
                {geti18nString('welcome_1a1_didntfind')}
            </Button>
        </WelcomeContainer>
    )
}
