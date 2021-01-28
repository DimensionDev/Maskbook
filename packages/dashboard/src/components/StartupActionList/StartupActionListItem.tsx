import {
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Button,
    ButtonProps,
    experimentalStyled as styled,
    Typography,
} from '@material-ui/core'

export interface StartupActionListItemProps {
    icon: React.ReactNode
    title: string
    description: string
    onClick(): void
    action: string
    color?: ButtonProps['color']
}
/**
 * This component is an abstraction of a list of "start up action suggestions".
 */
export function StartupActionListItem(props: StartupActionListItemProps) {
    const { onClick, color = 'primary', title, description, action, icon } = props
    return (
        <Container button>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText
                primary={
                    <Typography variant="body1" color="textPrimary">
                        {title}
                    </Typography>
                }
                secondary={
                    <Typography variant="caption" color="textSecondary">
                        {description}
                    </Typography>
                }
            />
            <ListItemSecondaryAction>
                <RoundButton color={color} onClick={onClick} size="small">
                    {action}
                </RoundButton>
            </ListItemSecondaryAction>
        </Container>
    )
}

const Container = styled(ListItem)(
    ({ theme }) => `
    border: 1px solid #f3f3f4;
    border-radius: 6px;
    /* border-radius: ${theme.shape.borderRadius}; */
`,
)
// TODO: Button should use "big border radius" variant instead of a styled one
const RoundButton = styled(Button)`
    border-radius: 20px;
    min-width: 80px;
`
