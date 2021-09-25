import { Typography, styled } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'

const Card = styled('div')(({ theme }) => ({
    borderRadius: Number(theme.shape.borderRadius) * 3,
    backgroundColor: MaskColorVar.primaryBackground,
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
