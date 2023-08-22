# @masknet/web3-constants

## Usage

The script offers two functions: `compressConstants` and `completeConstants`.

### Complete Constants

The `completeConstants` function ensures that all constant sets have the same fields, even if some fields are absent in certain sets. It fills in missing fields with default values based on their types.

```bash
npm run complete
```

To specify the names of constants for which fields need to be completed, open the script file and locate the following sections:

```typescript
completeConstants(join(__dirname, 'evm'), [
  // List of names for completion
])
```

Add the desired constant names within the array.

### Compress Constants

The `compressConstants` function reduces the size of constants JSON files by removing blank values or values that are repeated across constant sets.

```bash
npm run compress
```

To specify the names of constants to be compressed, open the script file and locate the following sections:

```typescript
compressConstants(join(__dirname, 'evm'), [
  // List of names for compression
])
```

Add the desired constant names within the array.

### Running the Script

To run the script, open your terminal and navigate to the project directory. Use the following command format:

```bash
node constants.js [options]
```

Available Options

- `--compress`: Run the `compressConstants` function.
- `--complete`: Run the `completeConstants` function.

You can combine multiple options. For example, to compress and complete constants, use:

```bash
node script.js --compress --complete
```
