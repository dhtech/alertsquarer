# alertsquarer
An visual experience for rendering prometheus alerts

## Prereqs
* 1 raspberry 3+
* nodejs
* 32x32 RGB-LED panels, one per team
* 5V 5A powersupply

**Disable sound on the pi** (*rmmod snd_bcm2835*)

## Install and run
```
cd /opt
git clone https://github.com/dhtech/alertsquarer.git
cd alertsquarer
npm install

# to run via ts-node, start in sepatare terminal windows:
npm run devapi
npm run devmatrix

# to build ts to js and run
npm run build
# and in separate terminal windows:
npm run api
npm run matrix
```

### Blacklist kernel module
The matrix driver doesn't work when the module `snd_bcm2835` is loaded so it needs to be blacklisted.

```
echo "blacklist snd_bcm2835" > /etc/modprobe.d/no_rpi_sound.conf
```

### systemctl
Autostart the services

#### Start the API
```
echo <<EOF >/etc/systemd/system/alertsquarer-api.service
[Unit]
Description=alertsquarer-api
After=network.target

[Service]
ExecStart=/usr/bin/npm run api
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/opt/alertsquarer

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable alertsquarer-api.service
systemctl start alertsquarer-api.service

```

#### Start the Matrix controller
```
echo <<EOF >/etc/systemd/system/alertsquarer-matrix.service
[Unit]
Description=alertsquarer-matrix
After=network.target

[Service]
ExecStart=/usr/bin/npm run matrix
Restart=always
User=root
Group=root
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/opt/alertsquarer

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable alertsquarer-matrix.service
systemctl start alertsquarer-matrix.service
```

## More information
The LED-library:
https://github.com/hzeller/rpi-rgb-led-matrix/tree/master
Has a lot of debug information

The Node binding:
https://github.com/alexeden/rpi-led-matrix
