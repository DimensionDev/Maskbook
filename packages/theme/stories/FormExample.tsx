import {
    Button,
    TextField,
    MuiThemeProvider,
    CardContent,
    CardHeader,
    CardActions,
    Card,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    Checkbox,
} from '@material-ui/core'
import { MaskLightTheme } from '../src/theme'

export default () => (
    <MuiThemeProvider theme={MaskLightTheme}>
        <Card>
            <CardHeader
                title="Subscribe"
                subheader="To subscribe to this website, please enter your email address here. We will send updates occasionally.">
                Subscribe
            </CardHeader>
            <CardContent>
                <TextField label="Email Address" type="email" />
                <Select value={0}>
                    <MenuItem value={0}>Item 1</MenuItem>
                    <MenuItem>Item 2</MenuItem>
                    <MenuItem>Item 3</MenuItem>
                </Select>
                <FormControlLabel control={<Switch name="send-me-ads" />} label="Send me ads" />
                <FormControlLabel label="Parent" control={<Checkbox />} />
            </CardContent>
            <CardActions>
                <Button variant="text">Cancel</Button>
                <Button>Subscribe</Button>
            </CardActions>
        </Card>
    </MuiThemeProvider>
)
