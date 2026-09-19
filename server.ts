import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { User, ChatMessage, CountryStat, GenderStat, StatsOverview } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Country flag mapper
const COUNTRY_FLAGS: Record<string, string> = {
  Tunisie: '🇹🇳',
  France: '🇫🇷',
  Algérie: '🇩🇿',
  Maroc: '🇲🇦',
  Sénégal: '🇸🇳',
  Canada: '🇨🇦',
  Belgique: '🇧🇪',
  Suisse: '🇨🇭',
  Liban: '🇱🇧',
  'Côte d\'Ivoire': '🇨🇮',
  Cameroun: '🇨🇲',
  Égypte: '🇪🇬',
  Autre: '🌍',
};

// Initial Seed Data
const DEFAULT_USERS: (User & { password?: string })[] = [
  {
    id: 'admin_master',
    name: 'Prof. Admin (Jury Concours)',
    email: 'admin891@gmail.com',
    password: 'sfaxmed981',
    country: 'Tunisie',
    countryCode: '🇹🇳',
    gender: 'Masculin',
    role: 'admin',
    status: 'vert',
    score: 100,
    evaluationNote: 'Compte Administrateur Officiel',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: 'user_yassine',
    name: 'Yassine Karray',
    email: 'yassine.karray@gmail.com',
    password: 'password123',
    country: 'Tunisie',
    countryCode: '🇹🇳',
    gender: 'Masculin',
    role: 'user',
    status: 'vert',
    score: 95,
    evaluationNote: 'Démonstration impeccable sur la décomposition en éléments simples.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastActive: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'user_amina',
    name: 'Amina Ben Salem',
    email: 'amina.bensalem@gmail.com',
    password: 'password123',
    country: 'Tunisie',
    countryCode: '🇹🇳',
    gender: 'Féminin',
    role: 'user',
    status: 'vert',
    score: 92,
    evaluationNote: 'Très bonne résolution de l\'intégrale de Riemann.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    lastActive: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'user_sophie',
    name: 'Sophie Martin',
    email: 'sophie.martin@gmail.com',
    password: 'password123',
    country: 'France',
    countryCode: '🇫🇷',
    gender: 'Féminin',
    role: 'user',
    status: 'vert',
    score: 88,
    evaluationNote: 'Excellente maîtrise de la formule de Taylor-Lagrange.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastActive: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'user_thomas',
    name: 'Thomas Dubois',
    email: 'thomas.dubois@gmail.com',
    password: 'password123',
    country: 'France',
    countryCode: '🇫🇷',
    gender: 'Masculin',
    role: 'user',
    status: 'orange',
    score: 72,
    evaluationNote: 'Manque la justification de convergence de la suite récurrente.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastActive: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'user_salma',
    name: 'Salma Mansouri',
    email: 'salma.mansouri@gmail.com',
    password: 'password123',
    country: 'Maroc',
    countryCode: '🇲🇦',
    gender: 'Féminin',
    role: 'user',
    status: 'orange',
    score: 65,
    evaluationNote: 'Vérification en cours de la réponse au problème 2.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastActive: new Date(Date.now() - 36000000).toISOString(),
  },
  {
    id: 'user_ousmane',
    name: 'Ousmane Diop',
    email: 'ousmane.diop@gmail.com',
    password: 'password123',
    country: 'Sénégal',
    countryCode: '🇸🇳',
    gender: 'Masculin',
    role: 'user',
    status: 'orange',
    score: 58,
    evaluationNote: 'Première ébauche envoyée, vérification requise.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    lastActive: new Date(Date.now() - 54000000).toISOString(),
  },
  {
    id: 'user_mehdi',
    name: 'Mehdi Zitouni',
    email: 'mehdi.zitouni@gmail.com',
    password: 'password123',
    country: 'Algérie',
    countryCode: '🇩🇿',
    gender: 'Masculin',
    role: 'user',
    status: 'rouge',
    score: 35,
    evaluationNote: 'Erreur sur le signe du déterminant et calcul de valeur propre.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    lastActive: new Date(Date.now() - 72000000).toISOString(),
  },
];

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    userId: 'user_yassine',
    senderId: 'user_yassine',
    senderName: 'Yassine Karray',
    senderRole: 'user',
    content: 'Bonjour M. l\'administrateur ! Voici ma solution pour la série entière : $\\sum_{n=0}^{+\\infty} \\frac{x^n}{n!} = e^x$. Pour l\'intégrale de Gauss, nous avons : $$\\int_{-\\infty}^{+\\infty} e^{-t^2} dt = \\sqrt{\\pi}$$ Est-ce valide ?',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    markedStatus: 'vrai',
  },
  {
    id: 'msg_2',
    userId: 'user_yassine',
    senderId: 'admin_master',
    senderName: 'Prof. Admin (Jury Concours)',
    senderRole: 'admin',
    content: 'Excellent travail Yassine ! Démonstration très propre et rigoureuse. Ton compte est validé avec la mention Verte (95 points). Continue ainsi !',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'msg_3',
    userId: 'user_mehdi',
    senderId: 'user_mehdi',
    senderName: 'Mehdi Zitouni',
    senderRole: 'user',
    content: 'Pour la matrice $M = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$, j\'ai trouvé $\\det(M) = 4 - 6 = 2$. C\'est correct ?',
    createdAt: new Date(Date.now() - 72000000).toISOString(),
    markedStatus: 'faux',
  },
  {
    id: 'msg_4',
    userId: 'user_mehdi',
    senderId: 'admin_master',
    senderName: 'Prof. Admin (Jury Concours)',
    senderRole: 'admin',
    content: 'Attention Mehdi, $1 \\times 4 - 2 \\times 3 = 4 - 6 = -2$ et non $+2$. C\'est une erreur de calcul importante. Ton compte passe en Rouge temporairement en attendant ta correction.',
    createdAt: new Date(Date.now() - 71000000).toISOString(),
  },
];

// Persistent storage setup
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DBData {
  users: (User & { password?: string })[];
  messages: ChatMessage[];
}

function loadDB(): DBData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      // Ensure admin exists with exact required credentials
      const hasAdmin = data.users?.some((u: User) => u.email === 'admin891@gmail.com');
      if (!hasAdmin) {
        data.users = [DEFAULT_USERS[0], ...(data.users || [])];
      }
      return data;
    }
  } catch (err) {
    console.error('Error reading DB file, using seed data:', err);
  }
  return { users: [...DEFAULT_USERS], messages: [...DEFAULT_MESSAGES] };
}

function saveDB(data: DBData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

let db = loadDB();

// Server-Sent Events subscribers for instant real-time sync across all open tabs
const sseClients: { id: string; res: express.Response }[] = [];

function notifyClients(event: string, payload: unknown) {
  const dataString = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].res.write(dataString);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Compute statistics
function calculateStats(): StatsOverview {
  const normalUsers = db.users.filter((u) => u.role === 'user');
  const totalUsers = normalUsers.length;
  const greenCount = normalUsers.filter((u) => u.status === 'vert').length;
  const orangeCount = normalUsers.filter((u) => u.status === 'orange').length;
  const redCount = normalUsers.filter((u) => u.status === 'rouge').length;
  const avgScore =
    totalUsers > 0
      ? Math.round((normalUsers.reduce((sum, u) => sum + (u.score || 0), 0) / totalUsers) * 10) /
        10
      : 0;

  // Country stats
  const countryMap: Record<
    string,
    { count: number; totalScore: number; topScore: number }
  > = {};
  for (const u of normalUsers) {
    const c = u.country || 'Autre';
    if (!countryMap[c]) {
      countryMap[c] = { count: 0, totalScore: 0, topScore: 0 };
    }
    countryMap[c].count++;
    countryMap[c].totalScore += u.score || 0;
    if (u.score > countryMap[c].topScore) {
      countryMap[c].topScore = u.score;
    }
  }

  const countryStats: CountryStat[] = Object.entries(countryMap)
    .map(([country, val]) => ({
      country,
      flag: COUNTRY_FLAGS[country] || '🌍',
      count: val.count,
      percentage: totalUsers > 0 ? Math.round((val.count / totalUsers) * 1000) / 10 : 0,
      avgScore: val.count > 0 ? Math.round((val.totalScore / val.count) * 10) / 10 : 0,
      topScore: val.topScore,
    }))
    .sort((a, b) => b.count - a.count || b.avgScore - a.avgScore);

  // Gender stats
  const genderMap: Record<string, { count: number; totalScore: number }> = {
    Masculin: { count: 0, totalScore: 0 },
    Féminin: { count: 0, totalScore: 0 },
  };
  for (const u of normalUsers) {
    const g = u.gender === 'Féminin' ? 'Féminin' : 'Masculin';
    genderMap[g].count++;
    genderMap[g].totalScore += u.score || 0;
  }

  const genderStats: GenderStat[] = (['Masculin', 'Féminin'] as const).map((gender) => ({
    gender,
    count: genderMap[gender].count,
    percentage:
      totalUsers > 0 ? Math.round((genderMap[gender].count / totalUsers) * 1000) / 10 : 0,
    avgScore:
      genderMap[gender].count > 0
        ? Math.round((genderMap[gender].totalScore / genderMap[gender].count) * 10) / 10
        : 0,
  }));

  return {
    totalUsers,
    totalMessages: db.messages.length,
    greenCount,
    orangeCount,
    redCount,
    avgScore,
    countryStats,
    genderStats,
  };
}

// ----------------- API ROUTES ----------------- //

// SSE endpoint for instant updates
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Math.random().toString(36).substring(2);
  sseClients.push({ id: clientId, res });

  // Send initial ping
  res.write(`event: ping\ndata: ${JSON.stringify({ time: Date.now() })}\n\n`);

  req.on('close', () => {
    const index = sseClients.findIndex((c) => c.id === clientId);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// Authentication: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Admin login check as specified by user:
  // "si un user écrit admin891@gmail.com et sfaxmed981 password entre a compte admin"
  if (cleanEmail === 'admin891@gmail.com' && password === 'sfaxmed981') {
    let adminUser = db.users.find((u) => u.email === 'admin891@gmail.com');
    if (!adminUser) {
      adminUser = DEFAULT_USERS[0];
      db.users.unshift(adminUser);
      saveDB(db);
    }
    const { password: _, ...safeAdmin } = adminUser;
    return res.json({ user: safeAdmin });
  }

  // Normal user login check
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(401).json({ error: 'Identifiants incorrects ou compte inexistant.' });
  }

  if (user.password && user.password !== password) {
    return res.status(401).json({ error: 'Mot de passe erroné.' });
  }

  user.lastActive = new Date().toISOString();
  saveDB(db);

  const { password: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// Authentication: Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, country, gender } = req.body;

  if (!name || !email || !password || !country || !gender) {
    return res.status(400).json({
      error: 'Tous les champs sont obligatoires (Nom, Email, Mot de passe, Pays, Sexe).',
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({
      error: 'Format d\'adresse email invalide. Veuillez entrer un email valide (ex: candidat@domaine.com).',
    });
  }

  // Admin registration redirect
  if (cleanEmail === 'admin891@gmail.com') {
    return res.status(400).json({
      error: 'Cet email est réservé au compte Administrateur officiel.',
      emailReserved: true,
    });
  }

  // Strict constraint: "un email ne peut être utilisé qu'une seule fois"
  const existingUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return res.status(409).json({
      error: `L'adresse email "${cleanEmail}" est DÉJÀ UTILISÉE. Règle stricte du concours : un email ne peut être utilisé qu'une seule et unique fois.`,
      emailAlreadyExists: true,
      existingEmail: cleanEmail,
    });
  }

  const newUser: User & { password?: string } = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    email: cleanEmail,
    password: password,
    country: country.trim(),
    countryCode: COUNTRY_FLAGS[country.trim()] || '🌍',
    gender: gender === 'Féminin' ? 'Féminin' : 'Masculin',
    role: 'user',
    status: 'orange', // "manque de vérification dessiner en orange" by default
    score: 0,
    evaluationNote: 'Nouveau compte inscrit. En attente de première évaluation.',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDB(db);

  notifyClients('user_registered', { user: newUser });
  notifyClients('stats_updated', calculateStats());

  const { password: _, ...safeUser } = newUser;
  return res.status(201).json({ user: safeUser });
});

// Get user list (for admin: all users with details; for leaderboard: public view)
app.get('/api/users', (req, res) => {
  const safeUsers = db.users
    .filter((u) => u.role === 'user')
    .map(({ password: _, ...safe }) => safe)
    .sort((a, b) => b.score - a.score);

  return res.json(safeUsers);
});

// Admin updates user evaluation (score, status: 'vert' | 'orange' | 'rouge', note)
const handleUserEvaluation = (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { status, score, evaluationNote } = req.body;

  const target = db.users.find((u) => u.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  if (status && ['vert', 'orange', 'rouge'].includes(status)) {
    target.status = status;
  }
  if (typeof score === 'number') {
    target.score = Math.max(0, Math.min(100, Math.round(score)));
  }
  if (typeof evaluationNote === 'string') {
    target.evaluationNote = evaluationNote;
  }

  saveDB(db);

  const { password: _, ...safeTarget } = target;
  notifyClients('user_evaluated', { user: safeTarget });
  notifyClients('stats_updated', calculateStats());

  return res.json({ ...safeTarget, user: safeTarget });
};

app.post('/api/users/:id/evaluate', handleUserEvaluation);
app.patch('/api/users/:id/evaluate', handleUserEvaluation);

// Get messages for a user conversation
app.get('/api/messages/:userId', (req, res) => {
  const { userId } = req.params;
  const messages = db.messages.filter((m) => m.userId === userId);
  return res.json(messages);
});

// Post a new message
app.post('/api/messages', (req, res) => {
  const { userId, senderId, senderName, senderRole, content, imageUrl, markedStatus } = req.body;

  if (!userId || !senderId || (!content?.trim() && !imageUrl)) {
    return res.status(400).json({ error: 'Données de message incomplètes.' });
  }

  const newMessage: ChatMessage = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId,
    senderId,
    senderName: senderName || (senderRole === 'admin' ? 'Prof. Admin' : 'Candidat'),
    senderRole: senderRole || 'user',
    content: (content || '').trim(),
    imageUrl: imageUrl || undefined,
    createdAt: new Date().toISOString(),
    markedStatus: markedStatus || undefined,
  };

  db.messages.push(newMessage);

  // Update user last active
  const targetUser = db.users.find((u) => u.id === userId);
  if (targetUser) {
    targetUser.lastActive = new Date().toISOString();
  }

  saveDB(db);

  notifyClients('new_message', newMessage);

  return res.status(201).json(newMessage);
});

// Mark a message as verified / unverified
const handleMessageStatus = (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { markedStatus } = req.body;

  const msg = db.messages.find((m) => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: 'Message non trouvé.' });
  }

  msg.markedStatus = markedStatus;
  saveDB(db);

  notifyClients('message_status_updated', msg);
  return res.json(msg);
};

app.post('/api/messages/:id/mark', handleMessageStatus);
app.post('/api/messages/:id/status', handleMessageStatus);
app.patch('/api/messages/:id/status', handleMessageStatus);

// Get global statistics
app.get('/api/stats', (req, res) => {
  return res.json(calculateStats());
});

// Get comprehensive rankings & statistics
app.get('/api/rankings', (req, res) => {
  const safeUsers = db.users
    .filter((u) => u.role === 'user')
    .map(({ password: _, ...safe }) => safe)
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const stats = calculateStats();
  return res.json({ users: safeUsers, stats });
});

// Reset demo data endpoint (useful for testing or fresh start)
app.post('/api/reset-demo', (req, res) => {
  db = {
    users: [...DEFAULT_USERS],
    messages: [...DEFAULT_MESSAGES],
  };
  saveDB(db);
  notifyClients('reset', {});
  return res.json({ status: 'ok', message: 'Données réinitialisées avec succès.' });
});

// Catch-all 404 handler for /api/* to always return JSON, never HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `Route API introuvable: ${req.method} ${req.path}` });
});

// ----------------- START SERVER / VITE MIDDLEWARE ----------------- //

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
