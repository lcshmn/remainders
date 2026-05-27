# Docker hosting on the VPS

This fork runs as a single-user Next.js container behind Nginx Proxy Manager.
Firebase login and donation-based Pro checks are disabled for self-hosting:
the dashboard is protected by `REMAINDERS_ADMIN_PASSWORD`, all Pro controls are
available to the signed-in admin user, and the wallpaper config is stored as JSON
in the Docker volume `remainders_data`.

## Portainer stack

1. Set `REMAINDERS_ADMIN_PASSWORD` in Portainer. Optionally set
   `REMAINDERS_AUTH_SECRET` to a long random string; if omitted, the admin
   password is also used for signing the session cookie.
2. Set `REMAINDERS_USERNAME` to the public API slug you want, for example
   `lucas`. Your wallpaper URL will be `/api/lucas`.
3. Deploy `docker-compose.yml` as a Portainer stack and add the variables in
   Portainer's environment-variable UI. For local use, copy `.env.example` to
   `.env`; Docker Compose reads it automatically.
4. In Nginx Proxy Manager, create a Proxy Host for the desired domain and point
   it to `http://remainders:3000`. The stack joins the existing external Docker
   network `public_net`, so no host port is published.

The app listens on port `3000` inside the container. Do not commit real
passwords, tokens, or domain-specific secrets to this public repository.

## Local check

```sh
cp .env.example .env
docker compose up --build
```

Then open `http://localhost:3000`.
