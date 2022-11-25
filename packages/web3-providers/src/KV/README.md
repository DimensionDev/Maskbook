# Key-Value storage

```typescript
// create a JSON storage
const storage = KeyValue.createJSON_Storage('hello_world')

// set value
await storage.set('foo', {
  key: 'value',
})

// get value
const response = await storage.get('foo')

console.assert(response?.key === 'value', 'ASSERTION FAILED')
```
