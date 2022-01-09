import { useState } from 'react'
import { useTheme } from '@mui/material/styles'

import { MobileStepper, Button, Box, Paper, Typography, Skeleton, Link } from '@mui/material'
import { KeyboardArrowLeft, KeyboardArrowRight, OpenInNew } from '@mui/icons-material'
import { makeStyles } from '@masknet/theme'
import { useChainId } from '@masknet/web3-shared-evm'
import { resolveImageLinkOnArtBlocks, resolveLinkOnArtBlocks } from '../pipes'
import { buildTokenId } from '../utils'
import type { Project } from '../types'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            flex: 1,
            overflow: 'auto',
            maxHeight: 350,
            borderRadius: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            padding: theme.spacing(4),
            paddingTop: theme.spacing(1),
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
        },
        skeletonImage: { height: 250 },
        skeletonTitle: { height: 20, width: '30%' },
        hidden: {
            display: 'none',
        },
        active: {
            display: 'block',
        },
        buttonNext: {
            paddingRight: theme.spacing(0),
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
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const [activeStep, setActiveStep] = useState(1)
    const chainId = useChainId()

    const currentSelectedToken = {
        tokenId: buildTokenId(Number(project.projectId), activeStep - 1),
        contract: { id: project.contract.id },
    }
    const maxSteps = Number(project.invocations)

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
        setIsImageLoaded(false)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
        setIsImageLoaded(false)
    }

    const handleImageLoad = () => {
        setIsImageLoaded(true)
    }

    return (
        <Box className={classes.root}>
            <Paper square elevation={0} className={classes.paper}>
                {!isImageLoaded ? (
                    <Skeleton className={classes.skeletonTitle} animation="wave" variant="rectangular" />
                ) : (
                    <Link
                        href={`${resolveLinkOnArtBlocks(chainId as number)}/token/${currentSelectedToken.tokenId}`}
                        target="_blank">
                        <Typography className={classes.title}>
                            {`#${currentSelectedToken.tokenId}`}{' '}
                            <OpenInNew className={classes.tokenIdRedirectionIcon} fontSize="small" />
                        </Typography>
                    </Link>
                )}

                <MobileStepper
                    variant="text"
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep - 1}
                    nextButton={
                        <Button
                            className={classes.buttonNext}
                            size="small"
                            onClick={handleNext}
                            disabled={activeStep === maxSteps}>
                            Next
                            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                        </Button>
                    }
                    backButton={
                        <Button size="small" onClick={handleBack} disabled={activeStep === 1}>
                            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                            Back
                        </Button>
                    }
                />
            </Paper>

            {!isImageLoaded ? (
                <Skeleton className={classes.skeletonImage} animation="wave" variant="rectangular" />
            ) : null}

            <Link
                href={`${resolveLinkOnArtBlocks(chainId as number)}/token/${currentSelectedToken.tokenId}`}
                target="_blank">
                <img
                    className={isImageLoaded ? undefined : classes.hidden}
                    width="100%"
                    src={`${resolveImageLinkOnArtBlocks(chainId as number)}/${currentSelectedToken?.tokenId}.png`}
                    alt=""
                    onLoad={handleImageLoad}
                />
            </Link>
        </Box>
    )
}
