import * as React from 'react'
import { getUrl } from '../../utils/utils'
import { geti18nString } from '../../utils/i18n'
import { Typography, Button, makeStyles } from '@material-ui/core'
import WelcomeContainer from './WelcomeContainer'
import { SelectPeopleUI } from '../InjectedComponents/SelectPeople'
import { useState } from 'react'
import { Person } from '../../database'

interface Props {
    next(person: Person): void
    didntFindAccount(): void
    identities: Person[]
}
const useStyles = makeStyles(theme => ({
    paper: {
        padding: '2rem 1rem 1rem 1rem',
        textAlign: 'center',
        '& > *': {
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
export default function Welcome({ next, identities, didntFindAccount }: Props) {
    const classes = useStyles()
    const [selected, setSelect] = useState<Person[]>([])
    return (
        <WelcomeContainer className={classes.paper}>
            <Typography variant="h5">{geti18nString('welcome_1a1_title')}</Typography>
            <SelectPeopleUI
                classes={{ root: classes.select }}
                hideSelectAll
                hideSelectNone
                showAtNetwork
                maxSelection={1}
                people={identities}
                selected={[]}
                frozenSelected={selected}
                onSetSelected={setSelect}
            />
            <Button
                disabled={selected.length === 0}
                onClick={() => next(selected[0])}
                variant="contained"
                color="primary"
                className={classes.button}>
                {geti18nString('welcome_1a1_next')}
            </Button>
            <br />
            <Button onClick={didntFindAccount} color="primary">
                {geti18nString('welcome_1a1_didntfind')}
            </Button>
        </WelcomeContainer>
    )
}
