# qbittorrent-tracker-add

A simple script to add trackers to a qBittorrent instance. qBittorrent doesn't currently allow adding trackers via a URL, so this script will download a list of trackers and inject them into the qBittorrent instance.

Just run it with docker:

```docker-compose.yml
docker-compose.yml

    ...
    qbittorrent-tracker-add:
        image: ghcr.io/nintendo424/qbittorrent-tracker-add:latest
        user: 1000:1000
        environment:
          - QBITTORRENT_ENDPOINT=${QBT_ENDPOINT}
          - QBITTORRENT_USERNAME=${QBT_USERNAME}
          - QBITTORRENT_PASSWORD=${QBT_PASSWORD}
          - TZ=America/New_York
        depends_on:
          - qbittorrent
        restart: unless-stopped
```

It runs at 4:00 AM by default, but you can set your own interval by setting the `INTERVAL` environment variable. It uses bree-js, so supports human-interval strings.