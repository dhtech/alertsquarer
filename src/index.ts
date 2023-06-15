import { 
  Font, 
  LedMatrix,
} from 'rpi-led-matrix';
import fastify from 'fastify';


const wait = (ms: number) => new Promise((resolve: any) => setTimeout(resolve, ms));

const defaultTTL = 600000;
const heartbeatTTL = 1100;
const teams = ['core', 'access', 'services'];
let heartbeatTS = 0;

const server = fastify();

interface IQueryString {
  team: string;
}
interface IBody {
  groupKey: string;
  status: string;
}
interface Alert {
  team: string;
  groupKey: string;
  status: string;
  timestamp: number;
}


let alerts: Record<string, Alert> = {};

server.post('/api/v1/alerts', async (request, reply) => {
  const { team } = request.query as IQueryString;
  const { groupKey, status } = request.body as IBody;

  if (team == 'heartbeat') {
    heartbeatTS = new Date().getTime();
    return {'result': 'success', 'message': `<3`};
  } else if (!teams.includes(team)) {
    console.error(`Unkown team ${team}.`);
    return {'result': 'failed', 'message': `${team} is not a valid team`};
  }

  alerts[`${team}:${groupKey}`] = { team, groupKey, status, timestamp: new Date().getTime() };

  return {'result': 'success', 'message': 'Sorry to hear, but noted'};
});

const pruneAlerts = () => {
  const startCount = Object.keys(alerts).length;

  const now = new Date().getTime();

  alerts = Object.keys(alerts).reduce((result: Record<string, Alert>, key: string) => {
    const alert = alerts[key];
    if (now - alert.timestamp < defaultTTL) {
        result[`${alert.team}:${alert.groupKey}`] = alert; //{ team, status, timestamp };
    } else {
      console.log('removing', (now - alert.timestamp), alert);
    }

    return result;
  }, {});
  const endCount = Object.keys(alerts).length;

  console.log(`Pruned ${startCount - endCount} alerts.`);
}
setInterval(pruneAlerts, 3000);


const countAlerts = (alerts: Record<string, Alert>): Record<string, number> => {
  const count = Object.keys(alerts).reduce((result: Record<string, number>, key: string) => {
    const alert = alerts[key];

    result[alert.team] = (result[alert.team] ?? 0) + 1;

    return result;
  }, {});
  console.log(count);
  return count;
}

const cb = (err: any, address: any) => {
  console.log('web started', address);
}
server.listen({ host: '0.0.0.0', port: 6379 }, cb);

(async () => {

  try {
    const matrix = new LedMatrix(
      {...LedMatrix.defaultMatrixOptions(), chainLength: 3},
      LedMatrix.defaultRuntimeOptions()
    );

    const smallFont = new Font('tom-thumb', `./tom-thumb.bdf`);
    const largeFont = new Font('10x20', `./10x20.bdf`);


    const drawState = (panel: number, name: string, errCnt: number, heartbeatAge: number, n: number) => {
	let bgColor = 0x000000;
	let fgColor = 0xffffff;

	if (errCnt < 0) {
	    bgColor=0x000000;
	    fgColor=0xffff00;
        } else if (errCnt == 0) {
	    bgColor=0x00ff00;
	    fgColor=0x000000;
	} else if (errCnt <= 2) {
	    bgColor=0xffff00;
	    fgColor=0x000000;
	} else if (errCnt <= 5) {
	    bgColor=0xff0000;
	    fgColor=0x000000;
	} else if (errCnt > 5) {
	    if (n%2 == 0) {
	      fgColor=0xff0000;
	    } else {
	      fgColor=0x000000;
	      bgColor=0xff0000;
	    }
	}

	const effErrCnt = (errCnt < 10) ? '' + errCnt : '>9';
        const xoffsetErr = (effErrCnt.length == 1 ? 10 : 5) + (panel * 32); //(16 - ((name.length * 4) / 2)) + (panel * 32);

	// Team Text
        matrix.font(smallFont);
        const xoffsetName = (16 - ((name.length * 4) / 2)) + (panel * 32);
	// No heartbeat 
	if (heartbeatAge > heartbeatTTL) {
	  const hbFgColor = (n % 2 == 0) ? 0xffffff : 0x000000;
	  const hbBgColor = (n % 2 == 0) ? 0xaa0000 : 0xffff00;

          matrix.fgColor(hbBgColor);
	  matrix.fill(0 + (panel * 32), 25, 32 + (panel * 32), 31);
	  matrix.fgColor(hbFgColor);
          matrix.drawText(name,  xoffsetName, 26);
	} else {
	  matrix.fgColor(0xffffff);
          matrix.drawText(name,  xoffsetName, 26);
	}

	// Background color
	matrix.fgColor(bgColor);
	matrix.fill(0 + (panel * 32), 0, 32 + (panel * 32), 24);

	// Count text
        matrix.font(largeFont);
	matrix.fgColor(fgColor);
        matrix.drawText(effErrCnt, xoffsetErr, 4);


    }

    let n = 0;
    // Update loop
    while (true) {
	n += 1;
	matrix.clear();

	const alertCount = countAlerts(alerts);
	const heartbeatAge = new Date().getTime() - heartbeatTS;
	teams.forEach((team: string, i: number) => {
	  const state = alertCount[team] ?? 0;
	  drawState(i, team.toUpperCase(), state, heartbeatAge, n);
	});

    	matrix.sync();
	await wait(200);
    }

  } catch (error) {
    console.log('ERROR');
    console.error(error);
  }
})();

