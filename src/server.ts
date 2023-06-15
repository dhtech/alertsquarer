import fastify from 'fastify';

const defaultTTL = 6000 //00
const heartbeatTTL = 1100
const teams = ['core', 'access', 'services', 'heartbeat'];

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

  if (!teams.includes(team)) {
    console.error(`Unkown team ${team}.`);
    return 'ERR';
  }

  alerts[`${team}:${groupKey}`] = { team, groupKey, status, timestamp: new Date().getTime() };

  console.log(alerts);
  return 'pong\n';
});

const pruneAlerts = () => {
  const startCount = Object.keys(alerts).length;

  const now = new Date().getTime();

  alerts = Object.keys(alerts).reduce((result: Record<string, Alert>, key: string) => {
    const alert = alerts[key];
    if (alert.team == 'heartbeat' && now - alert.timestamp < heartbeatTTL) {
	result[`${alert.team}:${alert.groupKey}`] = alert; //{ team, status, timestamp };
    } else if (alert.team != 'heartbeat' && now - alert.timestamp < defaultTTL) {
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


const cb = (err: any, address: any) => {
  console.log('web started', address);
}
server.listen({ host: '0.0.0.0', port: 6379 }, cb);

