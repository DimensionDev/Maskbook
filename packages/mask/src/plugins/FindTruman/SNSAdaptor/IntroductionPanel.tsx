import { makeStyles } from '@masknet/theme'
import { Avatar, Box, Button, Chip, Divider, Link, Typography } from '@mui/material'
import { ArrowForwardRounded } from '@mui/icons-material'
import { useContext } from 'react'
import { FindTrumanContext } from '../context'

const useStyles = makeStyles()((theme) => ({
    section: {},
    bannerImg: {
        width: '40%',
        objectFit: 'contain',
        float: 'left',
        marginRight: theme.spacing(2),
    },
    stepCard: {
        display: 'flex',
        marginBottom: theme.spacing(1),
    },
    stepImg: {
        width: '83px',
        objectFit: 'contain',
        borderRadius: '8px',
        marginRight: theme.spacing(2),
    },
    communityRow: {
        display: 'flex',
        columnGap: theme.spacing(1.5),
    },
    communityItem: {
        cursor: 'pointer',
    },
    divider: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    },
}))

interface IntroductionPanelProps {}

export default function IntroductionPanel(props: IntroductionPanelProps) {
    const { classes } = useStyles()
    const { const: consts } = useContext(FindTrumanContext)

    return consts ? (
        <Box>
            <Box className={classes.section}>
                <Typography variant="h6" gutterBottom>
                    {consts.introduction.banner.title}
                </Typography>
                <Box>
                    <img className={classes.bannerImg} src={consts.introduction.banner.img} />
                    {consts.introduction.banner.desc.map((e, index) => (
                        <Typography key={index} variant="body1" color="text.secondary" gutterBottom>
                            {e}
                        </Typography>
                    ))}
                </Box>
            </Box>
            <Divider className={classes.divider} />
            <Box className={classes.section}>
                <Typography variant="h6" gutterBottom>
                    {consts.introduction.step.title}
                </Typography>
                <Box>
                    {consts.introduction.step.steps.map((step, index) => (
                        <Box key={index} className={classes.stepCard}>
                            <img className={classes.stepImg} src={step.img} />
                            <Box>
                                <Typography variant="body1">{step.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {step.desc}
                                </Typography>
                                {step.link && (
                                    <Link
                                        href={step.link.url}
                                        target="_blank"
                                        variant="body2"
                                        rel="noopener noreferrer">
                                        {step.link.label}
                                    </Link>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
            <Divider className={classes.divider} />
            <Box className={classes.section}>
                <Typography variant="h6" gutterBottom>
                    {consts.introduction.community.title}
                </Typography>
                <Box className={classes.communityRow}>
                    {consts.introduction.community.channels.map((channel, index) => (
                        <Chip
                            key={index}
                            className={classes.communityItem}
                            avatar={<Avatar alt={channel.label} src={channel.img} />}
                            label={channel.label}
                            component="a"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={channel.url}
                        />
                    ))}
                </Box>
            </Box>
            <Divider className={classes.divider} />
            <Box className={classes.section}>
                <Typography variant="h6" gutterBottom>
                    {consts.introduction.plot.title}
                </Typography>
                <img
                    src={consts.introduction.plot.img}
                    style={{
                        width: '100%',
                        objectFit: 'contain',
                        marginBottom: '-5px',
                    }}
                />
                <Button
                    endIcon={<ArrowForwardRounded />}
                    fullWidth
                    variant="outlined"
                    component="a"
                    href={consts.introduction.plot.url}
                    target="_blank"
                    rel="noopener noreferrer">
                    {consts.introduction.plot.label}
                </Button>
            </Box>
        </Box>
    ) : null
}
