# Structured Backup format

## Principles

- Based-zip64 format (compression level: archive)
- Based-zip64 standard file encryption
- Structured tree structure

## General design

```plain
README.txt

# core file integrity check
files.json # file hash list with manifest* and README.txt

# the backup metadata
manifest.json
  - version = 3?
  - created at
  - build info
  - maskbook version
  - type = maskbook-backup
  - files = file hash list without manifest* and README.txt

# manifest.json with per persona private key signing
manifest-[persona-pubkey-hash].signed

permissions.json # original backup file "grantedHostPermissions" field.
user-groups.json # original backup file "userGroups" field.
posts.json       # original backup file "posts" field.
profiles.json    # original backup file "profiles" field.
personas.json    # original backup file "personas" field.
resources/*      # binary resource
```

## References

- <https://users.cs.jmu.edu/buchhofp/forensics/formats/pkzip.html>
