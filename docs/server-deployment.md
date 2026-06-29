# Ubuntu LAN Deployment

This deployment keeps Computech Ops available on internal HTTPS hostnames while it is being tested by the team.

## 1. Install Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker "$USER"
```

Log out and back in so your user can run Docker.

## 2. Clone the repo

```bash
git clone https://github.com/anchao0207/IT-system.git computech
cd computech
```

## 3. Create the server environment

```bash
cp .env.server.example .env
nano .env
```

Set these URL values based on how you are testing:

```env
NEXTAUTH_URL=https://computech.local
BASEROW_PUBLIC_URL=https://baserow.computech.local
BASEROW_URL=http://baserow
```

For basic container and Baserow testing, using the LAN IP over HTTP is fine.

For Microsoft Entra sign-in from other machines, use HTTPS. Microsoft only allows `http` redirect URIs for localhost-style development, not normal server IP or LAN host redirects. For a quick smoke test without setting up HTTPS, use an SSH tunnel and set:

```env
NEXTAUTH_URL=http://localhost:3000
```

Fill in the Auth.js, Microsoft Entra, Baserow token, table IDs, and `BASEROW_JWT_SECRET` values.

## 4. Start the stack

```bash
docker compose -f docker-compose.server.yml up -d --build
```

The app will be available at:

```text
https://computech.local
```

Baserow will be available at:

```text
https://baserow.computech.local
```

## 5. Set up internal hostnames

Point both names to the Ubuntu server's LAN IP using internal DNS, router DNS, or each tester's hosts file:

```text
YOUR_SERVER_LAN_IP computech.local baserow.computech.local
```

On Windows, the hosts file is:

```text
C:\Windows\System32\drivers\etc\hosts
```

## 6. Install Nginx

```bash
sudo apt update
sudo apt install -y nginx openssl
```

## 7. Create an internal HTTPS certificate

Public certificate authorities usually will not issue certificates for `.local` names. For internal testing, create a local certificate and trust it on tester machines:

```bash
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/computech.local.key \
  -out /etc/nginx/ssl/computech.local.crt \
  -subj "/CN=computech.local" \
  -addext "subjectAltName=DNS:computech.local,DNS:baserow.computech.local"
```

Copy `/etc/nginx/ssl/computech.local.crt` to each tester machine and trust it as a root/trusted certificate. Otherwise browsers will show a certificate warning.

## 8. Enable the Nginx reverse proxy

```bash
sudo cp deploy/nginx/computech.local.conf /etc/nginx/sites-available/computech.local.conf
sudo ln -s /etc/nginx/sites-available/computech.local.conf /etc/nginx/sites-enabled/computech.local.conf
sudo nginx -t
sudo systemctl reload nginx
```

The Docker services are bound to `127.0.0.1`, so LAN users reach them through Nginx instead of directly through ports `3000` and `8080`.

## 9. Check logs

```bash
docker compose -f docker-compose.server.yml logs -f app
docker compose -f docker-compose.server.yml logs -f baserow
```

## 10. Microsoft Entra redirect URI

For an SSH tunnel / localhost smoke test, add this redirect URI to the Microsoft Entra app registration:

```text
http://localhost:3000/api/auth/callback/microsoft-entra-id
```

For team testing from other machines, put the app behind HTTPS first, then add the HTTPS redirect URI:

```text
https://computech.local/api/auth/callback/microsoft-entra-id
```

Microsoft's redirect URI rules require HTTPS except for localhost development.

## 11. Updating after pushing to GitHub

```bash
git pull
docker compose -f docker-compose.server.yml up -d --build
```

## 12. Back up Baserow before major changes

Baserow data is stored in the Docker volume named `computech_baserow_data` when the project directory is named `computech`.

```bash
docker compose -f docker-compose.server.yml down
docker run --rm -v computech_baserow_data:/data -v "$PWD":/backup ubuntu tar czf /backup/baserow_data_backup.tar.gz /data
docker compose -f docker-compose.server.yml up -d
```
