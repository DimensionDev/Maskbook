import * as React from 'react'
import Typography from '@material-ui/core/Typography/Typography'
import Card from '@material-ui/core/Card/Card'
import CardHeader from '@material-ui/core/CardHeader/CardHeader'
import Avatar from '@material-ui/core/Avatar/Avatar'
import { FixedWidthFonts, withStylesTyped } from '../../utils/theme'
import { createBox } from '../../utils/components/Flex'
import classNames from 'classnames'
import createStyles from '@material-ui/core/styles/createStyles'

export interface IIdentity {
    nickname: string
    username: string
    fingerprint: string
}
interface Props extends IIdentity {
    avatar?: string
    onClick?(): void
}
const FixedWidth = createBox({ fontFamily: FixedWidthFonts })
export default withStylesTyped(theme =>
    createStyles({
        card: {
            display: 'inline-block',
            marginBottom: theme.spacing.unit * 3,
            textAlign: 'start',
            cursor: 'pointer',
            transition: '0.4s',
            '&:hover': {
                boxShadow: theme.shadows[6],
            },
        },
        text: {
            fontWeight: 'bold',
            marginRight: theme.spacing.unit,
        },
        avatarDisabled: {
            marginRight: 0,
        },
        emptyAvatar: {
            width: 0,
            height: 0,
        },
    }),
)<Props>(function({ avatar, onClick, classes, nickname, fingerprint, username }) {
    return (
        <Card onClick={onClick} className={classes.card}>
            <CardHeader
                classes={{ avatar: classNames({ [classes.avatarDisabled]: !avatar }) }}
                avatar={
                    avatar ? (
                        <Avatar aria-label={nickname} src={avatar.length > 3 ? avatar : undefined}>
                            {avatar.length <= 3 ? avatar : undefined}
                        </Avatar>
                    ) : (
                        <Avatar className={classes.emptyAvatar} />
                    )
                }
                title={
                    <>
                        <Typography inline className={classes.text}>
                            {nickname}
                        </Typography>
                        <Typography inline>{username}</Typography>
                    </>
                }
                subheader={<FixedWidth>{fingerprint}</FixedWidth>}
            />
        </Card>
    )
})
