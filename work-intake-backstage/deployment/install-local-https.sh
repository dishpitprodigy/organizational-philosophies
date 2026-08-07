#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <LAN-IP>" >&2
  exit 2
fi

public_ip=$1
if [[ ! $public_ip =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
  echo "Expected an IPv4 address; received: $public_ip" >&2
  exit 2
fi

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
temporary_dir=$(mktemp -d /tmp/work-intake-https.XXXXXX)
trap 'rm -rf -- "$temporary_dir"' EXIT

cp "$script_dir/nginx-work-intake.conf.template" "$temporary_dir/work-intake.conf"
sed -i "s/__PUBLIC_IP__/$public_ip/g" "$temporary_dir/work-intake.conf"
cp "$script_dir/work-intake-backstage.environment.template" "$temporary_dir/lan-environment"
sed -i "s/__PUBLIC_IP__/$public_ip/g" "$temporary_dir/lan-environment"

install_certificate=true
if sudo test -f /etc/pki/nginx/work-intake/server.crt \
  && sudo test -f /etc/pki/nginx/work-intake/private/server.key \
  && sudo openssl x509 -in /etc/pki/nginx/work-intake/server.crt -noout -checkip "$public_ip" >/dev/null 2>&1; then
  install_certificate=false
fi

if [[ $install_certificate == true ]]; then
  openssl req \
    -x509 \
    -newkey rsa:3072 \
    -sha256 \
    -nodes \
    -days 825 \
    -subj "/CN=$public_ip/O=Northstar Research Network/OU=Work Intake Prototype" \
    -addext "subjectAltName=IP:$public_ip,IP:127.0.0.1,DNS:localhost" \
    -addext "basicConstraints=critical,CA:FALSE" \
    -addext "keyUsage=critical,digitalSignature,keyEncipherment" \
    -addext "extendedKeyUsage=serverAuth" \
    -keyout "$temporary_dir/server.key" \
    -out "$temporary_dir/server.crt"
fi

sudo install -d -m 0755 /etc/pki/nginx/work-intake/private
if [[ $install_certificate == true ]]; then
  sudo install -m 0644 "$temporary_dir/server.crt" /etc/pki/nginx/work-intake/server.crt
  sudo install -m 0600 -o nginx -g nginx "$temporary_dir/server.key" /etc/pki/nginx/work-intake/private/server.key
fi
sudo install -m 0644 "$temporary_dir/work-intake.conf" /etc/nginx/conf.d/work-intake.conf
install -d -m 0700 "$HOME/.config/work-intake-backstage"
install -m 0600 "$temporary_dir/lan-environment" "$HOME/.config/work-intake-backstage/lan-environment"

sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx

if command -v firewall-cmd >/dev/null && sudo firewall-cmd --state >/dev/null 2>&1; then
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo firewall-cmd --reload
fi

echo "Installed nginx TLS proxy for https://$public_ip/work-intake"
echo "Installed the matching Backstage public URL in ~/.config/work-intake-backstage/lan-environment"
echo "The certificate is self-signed; import /etc/pki/nginx/work-intake/server.crt into a trust store or accept it explicitly in the browser."
