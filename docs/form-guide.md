# Form Guide

## General content

We use [`react-hook-form`](https://react-hook-form.com/) and [`zod`](https://github.com/colinhacks/zod#error-formatting) to create the form. Here are the basic steps to create a simple form

### 1. Use `zod` to create form field schema

```js
import { z as zod } from 'zod'

const schema = zod.object({
  name: zod.string(), // string
  age: zod.number('The age need be a number').positive('The age need to greater than 0'), // > 0
  country: zod.string('The country need be a string').optional(), // string | undefiend
  address: zod
    .string()
    .min(1)
    .refine((address) => ValidAddress(address), 'Invalid Address'), // You can use other methods to validate this field
})
```

### 2. Create type to be compatible with schema

```
type formType = {
  name: string
  age: number
  country?: string
  address: string
}
```

### 3. Call `useForm` to get the method collection

```js
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const methods = useForm<formType>({
    resolver: zodResolver(schema)
    defaultValues: {
        name: '',
        age: 1,
        address: ''
    }
})
```

`react-hook-form` provides [optional argumenjs](https://react-hook-form.com/api/useform) and you can change to meet your expectations

### 4. Create form UI with `Controller` and Material-UI component

The `react-hook-form` provides the `Controller` component without import other packages to support UI libraries

```js
const {
  control,
  handleSubmit,
  formState: { errors, dirtyFields, isDirty },
} = useForm(options)

const onSubmit = handleSubmit((data) => doSomething())

return (
  <form>
    <Controller
      render={({ field }) => <TextField {...field} helperText={errors.name?.message} error={dirtyFields.name} />}
      name="name"
    />
    <Button onClick={onSubmit} disabled={!isValid} />
  </form>
)
```

## Caveats

### Use `useFormContext` to get methods in children component

In practice, you may encounter situations where you need to get form methods in the children component. You can use `useFormContext` and `FormProvider` to resolve this question.

```js
// Parent component
const methods = useForm()
return <FormProvider {...methods}>....</FormProvider>

// Children component
const { control, register, formState } = useFormContext()
```

### Set field

Sometimes we need set some field from remote data. You can use `setValue` to change these field. If you want to trigger valid while setting the field, you can add the `shouldValid` option

```js
const { watch, setValue } = useForm()

// You can use watch to monitor some field change
const address = watch('address')
useEffect(() => {
  const { symbol } = fetchDataByAddress(address)
  setValue('symbol', symbol, { shouldValid: true })
}, [address])
```

### Be careful with watch

Sometimes we need to listen the field update to do something. Although you can use `watch` to listen field. But it will cause re-render problem. At the time of use you can think about whether you can use `getValues` to accomplish your needs.
