import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'
import classNames from 'classnames'
import Radio from '@material-ui/core/Radio/Radio'
import { FlexBox } from '../../utils/components/Flex'
import FormControl from '@material-ui/core/FormControl/FormControl'
import FormLabel from '@material-ui/core/FormLabel/FormLabel'
import RadioGroup from '@material-ui/core/RadioGroup/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel'

const Option = withStylesTyped(theme => ({
    root: {
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 4}px`,
        paddingBottom: 24,
        border: '1px solid',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: theme.shape.borderRadius * 2,
        transition: '0.4s',
        background: 'transparent',
        borderColor: theme.palette.grey[300],
        '& > *': {
            marginBottom: theme.spacing.unit,
        },
    },
    activated: {
        // TODO: Theme
        borderColor: '#7edfff',
        background: '#f3fcff',
    },
}))<{ activated: boolean }>(({ classes, children, activated }) => (
    <div className={classNames(classes.root, { [classes.activated]: activated })} children={children} />
))
interface Props {
    type: 'bio' | 'post'
    setType(type: Props['type']): void
}
export default withStylesTyped(theme =>
    createStyles({
        root: {
            display: 'flex',
            justifyContent: 'space-around',
        },
        group: { flexDirection: 'row' },
        radio: {
            marginTop: '-2em',
            zoom: 0.75,
            color: theme.palette.grey[300],
            '&$checked': {
                color: '#3497ff',
            },
        },
        checked: {},
        title: { fontWeight: 'bold', '& + *': { opacity: 0.6 } },
    }),
)<Props>(function Auto({ classes, type, setType }) {
    return (
        <div className={classes.root}>
            <FormControl component={'fieldset' as any} className={classes.root}>
                <RadioGroup
                    className={classes.group}
                    aria-label="Choose how to verify your account"
                    value={type}
                    onChange={(e, v) => setType(v as any)}>
                    <FormControlLabel
                        value="bio"
                        labelPlacement="top"
                        control={<Radio classes={{ root: classes.radio, checked: classes.checked }} />}
                        label={
                            <Option activated={type === 'bio'}>
                                <Typography variant="subtitle2" className={classes.title}>
                                    Add public key to profile
                                </Typography>
                                <Typography variant="subtitle2">
                                    Easy and lightweight.
                                    <br />
                                    Never disturb anyone.
                                </Typography>
                            </Option>
                        }
                    />
                    <FormControlLabel
                        value="post"
                        labelPlacement="top"
                        control={<Radio classes={{ root: classes.radio, checked: classes.checked }} />}
                        label={
                            <Option activated={type === 'post'}>
                                <Typography variant="subtitle2" className={classes.title}>
                                    Create a verification post
                                </Typography>
                                <Typography variant="subtitle2">
                                    We appreciate your valor!
                                    <br />
                                    Editable after posting.
                                </Typography>
                            </Option>
                        }
                    />
                </RadioGroup>
            </FormControl>
        </div>
    )
})
