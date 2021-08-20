import type { ReactElement, ReactNode } from 'react'
import React, { Children, cloneElement, isValidElement, useEffect, useState } from 'react'
import { useMap } from 'react-use'
import { Box } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()({
    hidden: {
        position: 'absolute',
        left: 10000,
    },
})

export interface StepCommonProps {
    toStep: (stepName: string, params?: any) => void
}

interface StepProps {
    name: string
    params?: any
    toStep?: (stepName: string, callbackParams?: any) => void
    children: (toNext: (stepName: string, callbackParams?: any) => void, params: any) => ReactNode
}

export const Step = ({ children, toStep, params }: StepProps) => {
    return <>{children(toStep!, params)}</>
}

interface StepperProps {
    defaultStep: string
    step?: {
        name: string
        params?: any
    }
    transition?: {
        render: ReactNode
        trigger: boolean
    }
    children: ReactElement[]
}
export const Stepper = (props: StepperProps) => {
    const { defaultStep, transition, step } = props
    const { classes } = useStyles()
    const [currentStep, setCurrentStep] = useState(defaultStep)
    const [currentTransition, setCurrentTransition] = useState(transition?.render)

    const [steps, { set: setSteps }] = useMap<{ [key: string]: ReactElement }>()
    const [stepParams, { set: setParam }] = useMap<{ [key: string]: any }>()

    const toStep = (stepName: string, params: any) => {
        setCurrentStep(stepName)
        setParam(stepName, params)
    }

    useEffect(() => {
        Children.forEach(props.children, (child: ReactElement<StepProps>) => {
            if (isValidElement(child)) {
                const name = child.props.name
                setSteps(name, child)
            }
        })
    }, [])

    useEffect(() => {
        if (!transition) {
            setCurrentTransition(null)
            return
        }
        if (transition.trigger) {
            setCurrentTransition(transition.render)
        } else {
            setCurrentTransition(null)
        }
    }, [transition])

    useEffect(() => {
        if (!step) return
        toStep(step.name, step.params)
    }, [step])

    return (
        <>
            <>{currentTransition}</>
            <>
                {steps[currentStep] ? (
                    <Box className={currentTransition ? classes.hidden : ''} width="100%">
                        {cloneElement(steps[currentStep], { toStep, params: stepParams[currentStep] })}
                    </Box>
                ) : null}
            </>
        </>
    )
}
