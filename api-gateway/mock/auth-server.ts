import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const PORT = process.env.AUTH_PORT || 3001;

const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1h in seconds
const REFRESH_TOKEN_EXPIRY = 120 * 60; // 2h in seconds

interface User {
  uid: string;
  login: string;
  password: string;
  roles: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

const now = new Date().toISOString();

const USERS: Record<string, User> = {
  user1: {
    uid: 'u-1001',
    login: 'alice',
    password: 'alice123',
    roles: ['ROLE_USER'],
    status: 'open',
    createdAt: now,
    updatedAt: now,
  },
  admin1: {
    uid: 'u-9999',
    login: 'admin',
    password: 'admin123',
    roles: ['ROLE_ADMIN'],
    status: 'open',
    createdAt: now,
    updatedAt: now,
  },
};

function findByLogin(login: string): User | undefined {
  return Object.values(USERS).find((u) => u.login === login);
}

function findByUid(uid: string): User | undefined {
  return Object.values(USERS).find((u) => u.uid === uid);
}

function tokenResponse(user: User) {
  const accessToken = jwt.sign(
    { uid: user.uid, login: user.login, roles: user.roles },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
  const refreshToken = crypto.randomUUID();
  const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRY * 1000).toISOString();
  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000).toISOString();

  return { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt };
}

function accountResponse(user: User) {
  const { password, ...rest } = user;
  return rest;
}

const app = express();
app.use(express.json());

// POST /token — authenticate (createTokenRequest)
app.post('/token', (req, res) => {
  const { login, password } = req.body;
  const user = findByLogin(login);

  if (!user || user.password !== password) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  res.json(tokenResponse(user));
});

// POST /account — create account (creatAccountRequest)
app.post('/account', (req, res) => {
  const { login, password, roles, status } = req.body;
  const uid = `u-${Date.now()}`;
  const timestamp = new Date().toISOString();

  res.status(201).json({
    uid,
    login,
    roles: roles || ['ROLE_USER'],
    status: status || 'open',
    createdAt: timestamp,
    updatedAt: timestamp,
  });
});

// GET /account/:uid — get account (response identical to POST /account)
app.get('/account/:uid', (req, res) => {
  const user = findByUid(req.params.uid);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json(accountResponse(user));
});

// PUT /account/:uid — edit account (editAccountRequest)
app.put('/account/:uid', (req, res) => {
  const user = findByUid(req.params.uid);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  const { login, roles, status } = req.body;
  const updated = {
    ...accountResponse(user),
    ...(login && { login }),
    ...(roles && { roles }),
    ...(status && { status }),
    updatedAt: new Date().toISOString(),
  };
  res.json(updated);
});

// POST /refresh-token/:refresh-token/token — refresh (response identical to POST /token)
app.post('/refresh-token/:refresh-token/token', (_req, res) => {
  const user = Object.values(USERS)[0];
  res.json(tokenResponse(user));
});

// GET /validate/:access-token — verify JWT
app.get('/validate/:access-token', (req, res) => {
  const at = req.params['access-token'];
  try {
    const payload = jwt.verify(at, JWT_SECRET) as jwt.JwtPayload;
    res.json({
      accessToken: at,
      expiresAt: payload.exp
        ? new Date(payload.exp * 1000).toISOString()
        : null,
    });
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.listen(PORT, () => {
  console.log(`Mock auth server listening on http://localhost:${PORT}`);
});
