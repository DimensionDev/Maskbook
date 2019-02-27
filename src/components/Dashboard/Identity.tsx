import * as React from 'react'
import Typography from '@material-ui/core/Typography/Typography'
import Card from '@material-ui/core/Card/Card'
import CardHeader from '@material-ui/core/CardHeader/CardHeader'
import Avatar from '@material-ui/core/Avatar/Avatar'
import { FixedWidthFonts, withStylesTyped } from '../../utils/theme'
import { createBox } from '../../utils/Flex'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import classNames from 'classnames'
import createStyles from '@material-ui/core/styles/createStyles'

export interface IIdentity {
    nickname: string
    username: string
    fingerprint: string
}
interface Props extends IIdentity {
    /* Design variant */
    avatar?: string
    atSymbolBefore?: boolean
    onClick?(): void
}
const FixedWidth = createBox({ fontFamily: FixedWidthFonts })
export default withStylesTyped((theme: Theme) =>
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
    }),
)<Props>(function Identity(props) {
    const { avatar, onClick } = props
    return (
        <Card onClick={onClick} className={props.classes.card}>
            <CardHeader
                classes={{ avatar: classNames({ [props.classes.avatarDisabled]: !avatar }) }}
                avatar={
                    avatar ? (
                        <Avatar aria-label={props.nickname} src={avatar.length > 3 ? avatar : undefined}>
                            {avatar.length <= 3 ? avatar : undefined}
                        </Avatar>
                    ) : (
                        <Avatar style={{ width: 0, height: 0 }} />
                    )
                }
                title={
                    <>
                        <Typography inline className={props.classes.text}>
                            {props.nickname}
                        </Typography>
                        <Typography inline>
                            {props.atSymbolBefore && '@'}
                            {props.username}
                        </Typography>
                    </>
                }
                subheader={<FixedWidth>{props.fingerprint}</FixedWidth>}
            />
        </Card>
    )
})
