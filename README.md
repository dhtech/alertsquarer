# alertsquarer
An visual experience for rendering prometheus alerts

## Prereqs
* 1 raspberry 3+
* nodejs
* 32x64 RGB-LED panels, default two
* 5V 5A powersupply

## Install and run
```
cd /opt
git clone https://github.com/dhtech/alertsquarer.git
cd alertsquarer
npm install

# to run via ts-node, start in sepatare terminal windows:
npm run dev

# to build ts to js and run
npm run build
npm run start
```

### Blacklist kernel module
The matrix driver doesn't work *at all* when the module `snd_bcm2835` is loaded so it needs to be blacklisted.

```
echo "blacklist snd_bcm2835" > /etc/modprobe.d/no_rpi_sound.conf
```

### Slightly improve display update
```
echo "isolcpus=3" >>  /boot/cmdline.txt
```

### systemctl
Autostart the service

```
echo <<EOF >/etc/systemd/system/alertsquarer.service
[Unit]
Description=alertsquarer
After=network.target

[Service]
ExecStart=/usr/bin/npm run start
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
systemctl enable alertsquarer.service
systemctl start alertsquarer.service

```

## Troubleshooting

### If the matrix-controller just restarts too fast
You might have forgotten to disable snd_bcm2835, see above.

## More information
The LED-library:
https://github.com/hzeller/rpi-rgb-led-matrix/tree/master
Has a lot of debug information

The Node binding:
https://github.com/alexeden/rpi-led-matrix
