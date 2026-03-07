# SteadLog Deployment on Plesk VPS

This deployment model separates source code from the public web root by using timestamped release directories and symlink switching.

## Target Structure

```text
/home/<plesk-user>/
  steadlog-repo/            # Git repository (source only)
  releases/                 # Built artifacts by timestamp
    20260306113000/
    20260306124500/
  current -> releases/<timestamp>
  httpdocs -> current
  httpdocs-old/             # Backup of original web root
```

## One-Time Migration

Run these once on the server:

```bash
cd /home/<plesk-user>

mkdir -p steadlog-repo
rsync -a --delete --exclude=".git" httpdocs/ steadlog-repo/
rsync -a httpdocs/.git/ steadlog-repo/.git/

mkdir -p releases
mv httpdocs httpdocs-old
ln -sfn /home/<plesk-user>/current /home/<plesk-user>/httpdocs
```

After migration, Git operations must run only inside `steadlog-repo`.

## Deploy Flow

`deploy.sh` in repo root performs:

1. `npm ci`
2. `npm run build`
3. Creates a new release directory in `/home/<plesk-user>/releases/<timestamp>`
4. Copies `dist/*` into that release
5. Updates `current` symlink to the new release
6. Ensures `httpdocs` points at `current`
7. Removes old releases and keeps the newest 5

Deploy command:

```bash
cd /home/<plesk-user>/steadlog-repo
./deploy.sh
```

## Rollback

List releases:

```bash
ls -dt /home/<plesk-user>/releases/*
```

Point `current` to a previous release (example):

```bash
cd /home/<plesk-user>
ln -sfn releases/<previous-release> current
ln -sfn /home/<plesk-user>/current /home/<plesk-user>/httpdocs
```

Rollback is instant because it only switches symlinks.
