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

## More information
The LED-library:
https://github.com/hzeller/rpi-rgb-led-matrix/tree/master
Has a lot of debug information

The Node binding:
https://github.com/alexeden/rpi-led-matrix