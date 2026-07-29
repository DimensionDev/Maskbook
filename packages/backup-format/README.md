# Backup format

## Backup file container

Binary format:

```plain
Magic header: 16 bytes
Data: Arbitrary length
Checksum (SHA-256): 32 bytes
```

Supported encrypted container versions:

- `MASK-BACKUP-V000`: legacy read-only format using PBKDF2-HMAC-SHA256 with 10,000 iterations.
- `MASK-BACKUP-V001`: current format using PBKDF2-HMAC-SHA256 with 10,000,000 iterations. New backups always use this version.
