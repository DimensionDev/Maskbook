import { Typography, styled } from '@material-ui/core'

const Card = styled('div')(({ theme }) => ({
    borderRadius: Number(theme.shape.borderRadius) * 3,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(5),
    marginBottom: theme.spacing(2),
}))

const CardTitle = styled(Typography)(({ theme }) => ({
    fontSize: 18,
    color: theme.palette.text.primary,
    paddingBottom: theme.spacing(4),
}))

export interface SettingCardProps extends React.PropsWithChildren<{}> {
    title: string
}

export default function SettingCard(props: SettingCardProps) {
    return (
        <Card>
            <CardTitle>{props.title}</CardTitle>
            {props.children}
        </Card>
    )
}
