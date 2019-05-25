import * as React from 'react'
import Typography from '@material-ui/core/Typography/Typography'
import Card from '@material-ui/core/Card/Card'
import CardHeader from '@material-ui/core/CardHeader/CardHeader'
import { FixedWidthFonts, withStylesTyped } from '../../utils/theme'
import { createBox } from '../../utils/components/Flex'
import classNames from 'classnames'
import createStyles from '@material-ui/core/styles/createStyles'
import { Avatar } from '../../utils/components/Avatar'
import { Person } from '../../extension/background-script/PeopleService'

interface Props {
    person: Person
    onClick?(): void
}
const FixedWidth = createBox({ fontFamily: FixedWidthFonts })
export default withStylesTyped(theme =>
    createStyles({
        card: {
            display: 'inline-block',
            marginBottom: theme.spacing(3),
            textAlign: 'start',
            cursor: 'pointer',
            transition: '0.4s',
            '&:hover': {
                boxShadow: theme.shadows[6],
            },
            width: '27.5em',
        },
        text: {
            fontWeight: 'bold',
            marginRight: theme.spacing(1),
        },
        avatarDisabled: {
            marginRight: 0,
        },
        emptyAvatar: {
            width: 0,
            height: 0,
        },
    }),
)<Props>(function({ person, classes, onClick }) {
    const { avatar, fingerprint, nickname, username } = person
    return (
        <Card onClick={onClick} className={classes.card}>
            <CardHeader
                classes={{ avatar: classNames({ [classes.avatarDisabled]: !avatar }) }}
                avatar={<Avatar className={classNames({ [classes.emptyAvatar]: !avatar })} person={person} />}
                title={
                    <>
                        <Typography display="inline" className={classes.text}>
                            {nickname}
                        </Typography>
                        <Typography display="inline">{username}</Typography>
                    </>
                }
                subheader={<FixedWidth>{fingerprint}</FixedWidth>}
            />
        </Card>
    )
})
