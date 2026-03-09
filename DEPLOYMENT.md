# Steadlog Deployment (Plesk + Vite SPA)

This project deploys static Vite build output to a Plesk VPS using timestamped releases and atomic symlink switching.

## Directory Layout

```text
/var/www/vhosts/steadlog.com/
  repo/                 # Git checkout of this project
  releases/             # Timestamped build releases (YYYYMMDDHHMMSS)
  current -> releases/<timestamp>
  httpdocs -> current
```

`httpdocs` is the web root in Plesk. It should always point to `current`, and `current` points to one release.

## Release Strategy

`deploy.sh` (run on VPS) performs:

1. `npm ci`
2. `npm run build`
3. Create release folder: `releases/YYYYMMDDHHMMSS`
4. `rsync` `dist/` contents into the new release
5. Atomically switch `current` symlink to the new release
6. Ensure `httpdocs -> current`
7. Keep only the newest 5 releases

If `httpdocs` already exists as a directory (not a symlink), the script moves it to:

```text
/var/www/vhosts/steadlog.com/httpdocs.backup.<timestamp>
```

## Deploy Workflow

1. Push/update source code in `/var/www/vhosts/steadlog.com/repo`.
2. Run:

```bash
/var/www/vhosts/steadlog.com/repo/deploy.sh
```

3. Confirm active release:

```bash
readlink -f /var/www/vhosts/steadlog.com/current
readlink -f /var/www/vhosts/steadlog.com/httpdocs
```

## Rollback Command

List available releases:

```bash
ls -1 /var/www/vhosts/steadlog.com/releases | sort
```

Roll back to a previous release (replace `<timestamp>`):

```bash
ln -sfn /var/www/vhosts/steadlog.com/releases/<timestamp> /var/www/vhosts/steadlog.com/.current.tmp
mv -Tf /var/www/vhosts/steadlog.com/.current.tmp /var/www/vhosts/steadlog.com/current
ln -sfn /var/www/vhosts/steadlog.com/current /var/www/vhosts/steadlog.com/.httpdocs.tmp
mv -Tf /var/www/vhosts/steadlog.com/.httpdocs.tmp /var/www/vhosts/steadlog.com/httpdocs
```

## Rsync Deploy From Barn (Optional)

For direct static sync from the development machine:

```bash
rsync -avz --delete dist/ steadlog-com@steadlog.com:/var/www/vhosts/steadlog.com/httpdocs/
```

This command is also available as:

```bash
npm run deploy
```
