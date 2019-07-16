import * as React from 'react'
import { geti18nString } from '../../utils/i18n'
import { FormControl, RadioGroup, FormControlLabel, Radio, Typography, Theme, makeStyles } from '@material-ui/core'

const useOptionStyles = makeStyles<Theme, { activated: boolean }, 'root'>(theme => ({
    root: props => ({
        padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
        paddingBottom: 24,
        border: '1px solid',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: theme.shape.borderRadius * 2,
        transition: '0.4s',
        // TODO: Theme
        background: props.activated ? '#f3fcff' : 'transparent',
        // TODO: Theme
        borderColor: props.activated ? '#7edfff' : theme.palette.grey[300],
        '& > *': {
            marginBottom: theme.spacing(1),
        },
    }),
}))
function Option(props: React.PropsWithChildren<{ activated: boolean }>) {
    const classes = useOptionStyles(props)
    return <div className={classes.root} children={props.children} />
}
interface Props {
    bioDisabled: boolean
    type: 'bio' | 'post'
    setType(type: Props['type']): void
}
const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        justifyContent: 'space-around',
    },
    group: { flexDirection: 'row' },
    radio: {
        marginTop: '-2em',
        marginBottom: '1em',
        zoom: 0.75,
        color: theme.palette.grey[300],
        '&$checked': {
            color: '#3497ff',
        },
    },
    checked: {},
    title: { fontWeight: 'bold', '& + *': { opacity: 0.6 } },
    red: { color: 'red' },
}))
export default function Auto({ type, setType, bioDisabled }: Props) {
    const classes = useStyles()
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
}
