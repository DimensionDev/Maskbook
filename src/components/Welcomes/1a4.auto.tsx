import * as React from 'react'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import createStyles from '@material-ui/core/styles/createStyles'
import classNames from 'classnames'
import Radio from '@material-ui/core/Radio/Radio'
import FormControl from '@material-ui/core/FormControl/FormControl'
import RadioGroup from '@material-ui/core/RadioGroup/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel'
import { geti18nString } from '../../utils/i18n'

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
    bioDisabled: boolean
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
        red: { color: 'red' },
    }),
)<Props>(function Auto({ classes, type, setType, bioDisabled }) {
    return (
        <div className={classes.root}>
            <FormControl component={'fieldset' as any} className={classes.root}>
                <RadioGroup
                    className={classes.group}
                    aria-label={geti18nString('welcome_1a4_auto_radio_aria')}
                    value={type}
                    onChange={(e, v) => setType(v as any)}>
                    <FormControlLabel
                        disabled={bioDisabled}
                        value="bio"
                        labelPlacement="top"
                        control={<Radio classes={{ root: classes.radio, checked: classes.checked }} />}
                        label={
                            <Option activated={type === 'bio'}>
                                <Typography variant="subtitle2" className={classes.title}>
                                    {geti18nString('welcome_1a4_auto_profile_title')}
                                </Typography>
                                <Typography variant="subtitle2">
                                    {geti18nString('welcome_1a4_auto_profile_description1')}
                                    <br />
                                    {geti18nString('welcome_1a4_auto_profile_description2')}
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
                                    {geti18nString('welcome_1a4_auto_post_title')}
                                </Typography>
                                <Typography variant="subtitle2">
                                    {geti18nString('welcome_1a4_auto_post_description1')}
                                    <br />
                                    {geti18nString('welcome_1a4_auto_post_description2')}
                                </Typography>
                            </Option>
                        }
                    />
                </RadioGroup>
            </FormControl>
        </div>
    )
})
