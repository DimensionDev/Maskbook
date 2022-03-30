import { useState } from 'react'
import { useTheme } from '@mui/material/styles'

import { MobileStepper, Button, Box, Paper, Typography, Skeleton, Link } from '@mui/material'
import { KeyboardArrowLeft, KeyboardArrowRight, OpenInNew } from '@mui/icons-material'
import { makeStyles } from '@masknet/theme'
import { useChainId } from '@masknet/web3-shared-evm'
import { resolveImageLinkOnArtBlocks, resolveTokenLinkOnArtBlocks } from '../pipes'
import { buildTokenId } from '../utils'
import type { Project } from '../types'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            borderRadius: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        title: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(0.5),
        },
        paper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'background.default',
            paddingRight: theme.spacing(1),
            paddingLeft: theme.spacing(1),
        },
        skeletonImage: { height: 304 },
        skeletonTitle: { height: 20, width: '30%', marginLeft: theme.spacing(2) },
        hidden: {
            display: 'none',
        },
        active: {
            display: 'block',
        },
        buttonPrev: {
            marginRight: theme.spacing(0.5),
        },
        buttonNext: {
            marginLeft: theme.spacing(0.5),
        },
        tokenTitle: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        tokenLinks: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: 65,
        },
        tokenIdRedirectionIcon: {
            verticalAlign: 'text-bottom',
            marginLeft: theme.spacing(0.5),
        },
        stepper: {
            backgroundColor: 'inherit',
        },
        imageContainer: {
            textAlign: 'center',
        },
        image: {
            maxHeight: 300,
        },
    }
})

export interface CollectionProps {
    key: string
    project: Project
}

export function CollectionView(props: CollectionProps) {
    const theme = useTheme()
    const { classes } = useStyles()
    const { project } = props
    const [isImageLoaded, setImageLoaded] = useState(false)
    const [activeStep, setActiveStep] = useState(1)
    const chainId = useChainId()

    const currentSelectedToken = {
        tokenId: buildTokenId(Number(project.projectId), activeStep - 1),
        contract: { id: project.contract.id },
    }
    const maxSteps = Number.parseInt(project.invocations, 10)

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
        setImageLoaded(false)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
        setImageLoaded(false)
    }

    const handleImageLoad = () => {
        setImageLoaded(true)
    }

    const tokenLink = resolveTokenLinkOnArtBlocks(chainId, currentSelectedToken.tokenId)

    return (
        <Box className={classes.root}>
            <Paper square elevation={0} className={classes.paper}>
                {!isImageLoaded ? (
                    <Skeleton className={classes.skeletonTitle} animation="wave" variant="rectangular" />
                ) : (
                    <Link href={tokenLink} target="_blank">
                        <Typography className={classes.title}>
                            #{currentSelectedToken.tokenId}
                            <OpenInNew className={classes.tokenIdRedirectionIcon} fontSize="small" />
                        </Typography>
                    </Link>
                )}

                <MobileStepper
                    className={classes.stepper}
                    variant="text"
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep - 1}
                    nextButton={
                        <Button
                            className={classes.buttonNext}
                            size="small"
                            variant="text"
                            onClick={handleNext}
                            disabled={activeStep === maxSteps}>
                            Next
                            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                        </Button>
                    }
                    backButton={
                        <Button
                            className={classes.buttonPrev}
                            size="small"
                            variant="text"
                            onClick={handleBack}
                            disabled={activeStep === 1}>
                            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                            Back
                        </Button>
                    }
                />
            </Paper>

            {!isImageLoaded ? (
                <Skeleton className={classes.skeletonImage} animation="wave" variant="rectangular" />
            ) : null}

            <div className={classes.imageContainer}>
                <Link href={tokenLink} target="_blank">
                    <img
                        className={isImageLoaded ? classes.image : classes.hidden}
                        src={resolveImageLinkOnArtBlocks(chainId, `${currentSelectedToken?.tokenId}.png`)}
                        alt="collection collectible"
                        onLoad={handleImageLoad}
                    />
                </Link>
            </div>
        </Box>
    )
}
