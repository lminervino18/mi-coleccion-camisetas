import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const USER = __ENV.LOAD_USER || 'lminervino18';
const PASSWORD = __ENV.LOAD_PASSWORD || 'Hermanis123';

export const options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '40s', target: 25 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    // Deliberately modest: this runs against a free tier, not a load-balanced fleet.
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1500'],
  },
};

export function setup() {
  const response = http.post(
    `${BASE}/api/auth/login`,
    JSON.stringify({ username: USER, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(response, { 'login succeeded': (r) => r.status === 200 });
  return { cookie: response.cookies['camisetas_session']?.[0]?.value ?? '' };
}

export default function (data) {
  const authenticated = {
    headers: { Cookie: `camisetas_session=${data.cookie}` },
  };

  const collection = http.get(`${BASE}/api/shirts?pageSize=24`, authenticated);
  check(collection, {
    'collection listed': (r) => r.status === 200,
    'collection is paginated': (r) => r.json('items') !== undefined,
  });

  const anonymous = http.get(`${BASE}/`);
  check(anonymous, { 'landing served': (r) => r.status === 200 });

  const health = http.get(`${BASE}/api/health`);
  check(health, { 'health reports ok': (r) => r.status === 200 });

  sleep(1);
}
