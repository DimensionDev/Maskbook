# Form Guide

## General content

We use [`react-hook-form`](https://react-hook-form.com/) and [`zod`](https://github.com/colinhacks/zod#error-formatting) to create the form. Here are the basic steps to create a simple form

### 1. Use `zod` to create form field schema

You can set error message with i18n, you can read this file to learn about [i18n](i18n-guide.md)

```tsx
import { z as zod } from 'zod'

export function ComponentForm() {
  const t = useComponentI18N() // Set error message with i18n.
  const schema = zod.object({
    name: zod.string(), // string
    age: zod.number(t.needBeNumber()).positive(t.needGreaterThanZero()), // > 0
    country: zod.string(t.countyNeedBeString()).optional(), // string | undefined
    address: zod
      .string()
      .min(1)
      .refine((address) => ValidAddress(address), t.InvalidAddress), // You can use other methods to validate this field
  })

  // ...
}
```

### 2. Call `useForm` to get the method collection

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const methods = useForm<formType>({
  resolver: zodResolver(schema),
  defaultValues: {
    name: '',
    age: 1,
    address: '',
  },
})
```

`react-hook-form` provides [optional arguments](https://react-hook-form.com/api/useform), you can change it on demand.

### 3. Create form UI with `Controller` and Material-UI component

The `react-hook-form` provides the `Controller` component without import other packages to support UI libraries

```tsx
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

In practice, you may need to get form methods in the children component. You can use `useFormContext` and `FormProvider` to resolve this problem.

```tsx
// Parent component
const methods = useForm()
return <FormProvider {...methods}>....</FormProvider>

// Children component
const { control, register, formState } = useFormContext()
```

### Set field

Sometimes we need set some field from remote data. You can use `setValue` to change these field. If you want to trigger valid while setting the field, you can add the `shouldValid` option

```tsx
const { watch, setValue } = useForm()

// You can use watch to monitor some field change
const address = watch('address')
useEffect(() => {
  const { symbol } = fetchDataByAddress(address)
  setValue('symbol', symbol, { shouldValid: true })
}, [address])
```

### Be careful with watch

Sometimes we need to listen to the field update to do something. Although you can use `watch` to react to a field. But it will cause extra renders and cause a potential performance problem. Try to use `getValues` if that suits you.
