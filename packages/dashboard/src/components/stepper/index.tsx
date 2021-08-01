import type { ReactElement, ReactNode } from 'react'
import React, { Children, cloneElement, isValidElement, useEffect, useState } from 'react'
import { useMap } from 'react-use'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    hidden: {
        position: 'absolute',
        left: 10000,
    },
}))

export interface CommonProps {
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
    transition?: {
        render: ReactNode
        trigger: boolean
    }
    children: ReactElement[]
}
export const Stepper = (props: StepperProps) => {
    const classes = useStyles()
    const { defaultStep, transition } = props
    const [currentStep, setCurrentStep] = useState(defaultStep)
    const [currentTransition, setCurrentTransition] = useState(transition?.render)

    const [steps, { set: setSteps }] = useMap<{ [key: string]: ReactElement }>()
    const [stepParams, { set: setParam }] = useMap<{ [key: string]: any }>()

    const toStep = (stepName: string, params: any) => {
        setCurrentStep(stepName)
        setParam(stepName, params)
    }

    useEffect(() => {
        if (!transition) return
        if (transition.trigger) {
            setCurrentTransition(transition.render)
        } else {
            setCurrentTransition(null)
        }
    }, [transition])

    useEffect(() => {
        Children.forEach(props.children, (child: ReactElement<StepProps>) => {
            if (isValidElement(child)) {
                const name = child.props.name
                setSteps(name, cloneElement(child, { toStep }))
            }
        })
    }, [])

    useEffect(() => {}, [currentStep])

    return (
        <>
            <>{currentTransition}</>
            <>
                {steps[currentStep] ? (
                    <div className={currentTransition ? classes.hidden : ''}>
                        {cloneElement(steps[currentStep], { params: stepParams[currentStep] })}
                    </div>
                ) : null}
            </>
        </>
    )
}
