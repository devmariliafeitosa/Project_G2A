import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "ifce-taua-secret-key-2024";

app.use(cors());
app.use(express.json());

// Mock Database
const users = [
  {
    id: "99",
    email: "admin@ifce.edu.br",
    login: "admin",
    name: "Administrador Geral",
    password: bcrypt.hashSync("123456", 10),
    role: "Admin",
    registration: "ADMIN01",
    campus: "Tauá",
    status: "Ativo",
    cargaHoraria: 0,
    disciplinasMinistradas: [],
    birthDate: "",
    areaAtuacao: "",
    ingressoYear: "",
    regime: "40h/DE (Dedicação Exclusiva)",
    leaveType: "Ativo",
<<<<<<< HEAD
    hasReducedWorkload: false,
  },
  {
    id: "100",
    email: "coord@ifce.edu.br",
    login: "coord",
    name: "Saulo Anderson",
    password: bcrypt.hashSync("123456", 10),
    role: "Coordenador",
    registration: "COORD01",
    campus: "Tauá",
    status: "Ativo",
    cargaHoraria: 10,
    disciplinasMinistradas: [],
    birthDate: "1980-01-01",
    areaAtuacao: "Informação e Comunicação",
    ingressoYear: "2015",
    regime: "Dedicação Exclusiva",
    leaveType: "Nenhum",
    hasReducedWorkload: false,
    hasTeachingRole: true,
  },
=======
    hasReducedWorkload: false
  }
>>>>>>> backend
];

const notifications = [
  {
    id: "1",
    type: "Alerta",
    title: "Carga horária excedida",
<<<<<<< HEAD
    description:
      "O docente João Silva excedeu o limite de 20h em sala de aula.",
    timestamp: new Date().toISOString(),
    status: "Não lida",
    priority: "Alta",
    relatedPath: "teachers",
=======
    description: "O docente João Silva excedeu o limite de 20h em sala de aula.",
    timestamp: new Date().toISOString(),
    status: "Não lida",
    priority: "Alta",
    relatedPath: "teachers"
>>>>>>> backend
  },
  {
    id: "2",
    type: "Solicitação",
    title: "Nova solicitação de alocação",
<<<<<<< HEAD
    description:
      "O coordenador Pedro Santos solicitou alocação para a disciplina de Cálculo I.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "Não lida",
    priority: "Média",
    relatedPath: "courses",
  },
];

const reportHistory = [
  {
    id: "1",
    name: "Grade de Horários - 2024.1",
    user: "Admin Geral",
    date: "14/05/2026 14:20",
  },
  {
    id: "2",
    name: "Lotação Docente - Geral",
    user: "Admin Geral",
    date: "12/05/2026 09:15",
  },
=======
    description: "O coordenador Pedro Santos solicitou alocação para a disciplina de Cálculo I.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "Não lida",
    priority: "Média",
    relatedPath: "courses"
  }
];

const reportHistory = [
  { id: '1', name: 'Grade de Horários - 2024.1', user: 'Admin Geral', date: '14/05/2026 14:20' },
  { id: '2', name: 'Lotação Docente - Geral', user: 'Admin Geral', date: '12/05/2026 09:15' },
>>>>>>> backend
];

const occurrences = [
  {
    id: "1",
    teacherId: "2", // Maria Souza
    type: "Afastamento",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    status: "Ativa",
    reason: "Doutorado",
    needReplacement: true,
    affectedSubjectIds: ["1", "2"], // Cálculo I, Álgebra Linear
    impactDescription: "Afastamento integral para capacitação.",
    auditLogs: [
<<<<<<< HEAD
      {
        id: "1",
        user: "Administrador Geral",
        action: "Criação da ocorrência",
        timestamp: "2026-05-14T15:00:00Z",
      },
    ],
  },
=======
      { id: '1', user: 'Administrador Geral', action: 'Criação da ocorrência', timestamp: '2026-05-14T15:00:00Z' }
    ]
  }
>>>>>>> backend
];

// Helper for general authentication
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Helper for Admin check
const adminOnly = (req: any, res: any, next: any) => {
  authenticate(req, res, () => {
    if (req.user.role === "Admin") {
      next();
    } else {
      res.status(403).json({ error: "Acesso negado: Apenas administradores" });
    }
  });
};

// Auth Endpoints
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  // Login can be email, login field or registration (SIAPE)
<<<<<<< HEAD
  const user = users.find(
    (u) => u.email === email || u.login === email || u.registration === email,
  );
=======
  const user = users.find(u => u.email === email || u.login === email || u.registration === email);
>>>>>>> backend

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Credenciais incorretas" });
  }

  if (user.status === "Inativo") {
    return res.status(403).json({ error: "Este usuário está desativado" });
  }

<<<<<<< HEAD
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      registration: user.registration,
      campus: user.campus,
      hasTeachingRole: user.hasTeachingRole || false,
    },
    JWT_SECRET,
    { expiresIn: "1h" },
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      registration: user.registration,
      campus: user.campus,
      status: user.status,
      hasTeachingRole: user.hasTeachingRole || false,
    },
  });
=======
  const token = jwt.sign({ 
    id: user.id, 
    email: user.email,
    name: user.name,
    role: user.role,
    registration: user.registration,
    campus: user.campus
  }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, user: { 
    id: user.id, 
    email: user.email, 
    name: user.name, 
    role: user.role,
    registration: user.registration,
    campus: user.campus,
    status: user.status
  } });
>>>>>>> backend
});

app.post("/api/change-password", authenticate, (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
<<<<<<< HEAD
  const user = users.find((u) => u.id === req.user.id);
=======
  const user = users.find(u => u.id === req.user.id);
>>>>>>> backend

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ error: "Senha atual inválida" });
  }

  // Security validation (Server side)
<<<<<<< HEAD
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res
      .status(400)
      .json({ error: "A nova senha não atende aos critérios de segurança" });
  }

  if (bcrypt.compareSync(newPassword, user.password)) {
    return res
      .status(400)
      .json({ error: "A nova senha não pode ser igual à senha atual" });
=======
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({ error: "A nova senha não atende aos critérios de segurança" });
  }

  if (bcrypt.compareSync(newPassword, user.password)) {
    return res.status(400).json({ error: "A nova senha não pode ser igual à senha atual" });
>>>>>>> backend
  }

  user.password = bcrypt.hashSync(newPassword, 10);
  res.json({ message: "Senha alterada com sucesso" });
});

app.put("/api/profile", authenticate, (req: any, res) => {
<<<<<<< HEAD
  const user = users.find((u) => u.id === req.user.id);

=======
  const user = users.find(u => u.id === req.user.id);
  
>>>>>>> backend
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  const { name, email, birthDate, areaAtuacao } = req.body;

  // Validate required fields
  if (!name || !email || !areaAtuacao || !birthDate) {
<<<<<<< HEAD
    return res
      .status(400)
      .json({
        error:
          "Campos Nome, E-mail, Data de Nascimento e Área de Atuação são obrigatórios",
      });
  }

  if (!email.endsWith("@ifce.edu.br")) {
    return res
      .status(400)
      .json({ error: "O e-mail deve ser institucional (@ifce.edu.br)" });
=======
    return res.status(400).json({ error: "Campos Nome, E-mail, Data de Nascimento e Área de Atuação são obrigatórios" });
  }

  if (!email.endsWith('@ifce.edu.br')) {
    return res.status(400).json({ error: "O e-mail deve ser institucional (@ifce.edu.br)" });
>>>>>>> backend
  }

  // Update only allowed fields
  user.name = name;
  user.email = email;
  user.birthDate = birthDate;
  user.areaAtuacao = areaAtuacao;

  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.post("/api/deactivate-account", authenticate, (req: any, res) => {
  const { password } = req.body;
<<<<<<< HEAD
  const user = users.find((u) => u.id === req.user.id);
=======
  const user = users.find(u => u.id === req.user.id);
>>>>>>> backend

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: "Senha incorreta" });
  }

  user.status = "Inativo";
<<<<<<< HEAD
  console.log(
    `Conta desativada: ${user.name} (ID: ${user.id}) em ${new Date().toISOString()}`,
  );
  res.json({
    message: "Conta desativada com sucesso. Você será desconectado.",
  });
=======
  console.log(`Conta desativada: ${user.name} (ID: ${user.id}) em ${new Date().toISOString()}`);
  res.json({ message: "Conta desativada com sucesso. Você será desconectado." });
>>>>>>> backend
});

app.post("/api/refresh", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
<<<<<<< HEAD
    const user = users.find((u) => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });
    if (user.status === "Inativo")
      return res.status(403).json({ error: "Usuário inativo" });

    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        registration: user.registration,
        campus: user.campus,
        hasTeachingRole: user.hasTeachingRole || false,
      },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

=======
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });
    if (user.status === "Inativo") return res.status(403).json({ error: "Usuário inativo" });

    const newToken = jwt.sign({ 
      id: user.id, 
      email: user.email,
      name: user.name,
      role: user.role,
      registration: user.registration,
      campus: user.campus
    }, JWT_SECRET, { expiresIn: "1h" });
    
>>>>>>> backend
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
});

// User Management Endpoints (Admin Only)
<<<<<<< HEAD
app.get("/api/users", authenticate, (req: any, res) => {
  // Admins veem todos; coordenadores e professores não veem usuários Admin
  const safeUsers = users
    .filter((u) => req.user.role === "Admin" || u.role !== "Admin")
    .map(({ password, ...u }) => u);
=======
app.get("/api/users", adminOnly, (req, res) => {
  const safeUsers = users.map(({ password, ...u }) => u);
>>>>>>> backend
  res.json(safeUsers);
});

app.post("/api/users", adminOnly, (req, res) => {
<<<<<<< HEAD
  const {
    name,
    email,
    role,
    registration,
    campus,
    password,
    birthDate,
    areaAtuacao,
    login,
    ingressoYear,
    regime,
    status,
  } = req.body;

  if (
    !name ||
    !email ||
    !role ||
    !registration ||
    !birthDate ||
    !areaAtuacao ||
    !ingressoYear ||
    !regime
  ) {
    return res
      .status(400)
      .json({ error: "Todos os campos orbigatórios devem ser preenchidos" });
  }

  if (!email.endsWith("@ifce.edu.br")) {
    return res
      .status(400)
      .json({ error: "O e-mail deve ser institucional (@ifce.edu.br)" });
  }

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ error: "E-mail já cadastrado" });
  }
  if (login && users.find((u) => u.login === login)) {
=======
  const { name, email, role, registration, campus, password, birthDate, areaAtuacao, login, ingressoYear, regime, status } = req.body;
  
  if (!name || !email || !role || !registration || !birthDate || !areaAtuacao || !ingressoYear || !regime) {
     return res.status(400).json({ error: "Todos os campos orbigatórios devem ser preenchidos" });
  }

  if (!email.endsWith('@ifce.edu.br')) {
    return res.status(400).json({ error: "O e-mail deve ser institucional (@ifce.edu.br)" });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "E-mail já cadastrado" });
  }
  if (login && users.find(u => u.login === login)) {
>>>>>>> backend
    return res.status(400).json({ error: "Login de acesso já cadastrado" });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    role,
    registration,
    campus,
    birthDate,
    areaAtuacao,
    login,
    ingressoYear,
    regime: regime || "40h/DE (Dedicação Exclusiva)",
    status: status || "Ativo",
    cargaHoraria: 0,
    disciplinasMinistradas: [],
    leaveType: req.body.leaveType || "Ativo",
    hasReducedWorkload: req.body.hasReducedWorkload || false,
<<<<<<< HEAD
    password: bcrypt.hashSync(password || "ifce123", 10),
=======
    password: bcrypt.hashSync(password || "ifce123", 10)
>>>>>>> backend
  };

  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

app.put("/api/users/:id", adminOnly, (req, res) => {
  const { id } = req.params;
<<<<<<< HEAD
  const index = users.findIndex((u) => u.id === id);

  if (index === -1)
    return res.status(404).json({ error: "Usuário não encontrado" });

  const { email } = req.body;
  if (email && users.find((u) => u.email === email && u.id !== id)) {
=======
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return res.status(404).json({ error: "Usuário não encontrado" });

  const { email } = req.body;
  if (email && users.find(u => u.email === email && u.id !== id)) {
>>>>>>> backend
    return res.status(400).json({ error: "E-mail já cadastrado" });
  }

  users[index] = { ...users[index], ...req.body };
  const { password, ...safeUser } = users[index];
  res.json(safeUser);
});

app.delete("/api/users/:id", adminOnly, (req, res) => {
  const { id } = req.params;
<<<<<<< HEAD
  const index = users.findIndex((u) => u.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Usuário não encontrado" });

=======
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: "Usuário não encontrado" });
  
>>>>>>> backend
  users.splice(index, 1);
  res.status(204).send();
});

// Notification Endpoints (Admin Only)
app.get("/api/notifications", adminOnly, (req, res) => {
  res.json(notifications);
});

app.post("/api/notifications", adminOnly, (req, res) => {
  const newNotif = {
    id: Date.now().toString(),
    status: "Não lida",
    timestamp: new Date().toISOString(),
<<<<<<< HEAD
    ...req.body,
=======
    ...req.body
>>>>>>> backend
  };
  notifications.unshift(newNotif);
  res.status(201).json(newNotif);
});

app.patch("/api/notifications/:id", adminOnly, (req, res) => {
  const { id } = req.params;
<<<<<<< HEAD
  const index = notifications.findIndex((n) => n.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Notificação não encontrada" });
=======
  const index = notifications.findIndex(n => n.id === id);
  if (index === -1) return res.status(404).json({ error: "Notificação não encontrada" });
>>>>>>> backend

  notifications[index] = { ...notifications[index], ...req.body };
  res.json(notifications[index]);
});

app.delete("/api/notifications/:id", adminOnly, (req, res) => {
  const { id } = req.params;
<<<<<<< HEAD
  const index = notifications.findIndex((n) => n.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Notificação não encontrada" });
=======
  const index = notifications.findIndex(n => n.id === id);
  if (index === -1) return res.status(404).json({ error: "Notificação não encontrada" });
>>>>>>> backend

  notifications.splice(index, 1);
  res.status(204).send();
});

// Report History Endpoints (Admin Only)
app.get("/api/reports/history", adminOnly, (req, res) => {
  res.json(reportHistory);
});

app.post("/api/reports/history", adminOnly, (req, res) => {
  const newEntry = {
    id: Date.now().toString(),
    user: "Admin Geral", // Ideally from req.user
<<<<<<< HEAD
    date: new Date().toLocaleString("pt-BR"),
    ...req.body,
=======
    date: new Date().toLocaleString('pt-BR'),
    ...req.body
>>>>>>> backend
  };
  reportHistory.unshift(newEntry);
  res.status(201).json(newEntry);
});

// Occurrences Endpoints (Admin Only)
app.get("/api/occurrences", adminOnly, (req, res) => {
  res.json(occurrences);
});

app.post("/api/occurrences", adminOnly, (req: any, res) => {
  const newOccurrence = {
    id: Date.now().toString(),
    status: "Ativa",
    ...req.body,
    auditLogs: [
      {
        id: Date.now().toString(),
        user: req.user.name,
        action: "Criação da ocorrência",
<<<<<<< HEAD
        timestamp: new Date().toISOString(),
      },
    ],
=======
        timestamp: new Date().toISOString()
      }
    ]
>>>>>>> backend
  };
  occurrences.unshift(newOccurrence);
  res.status(201).json(newOccurrence);
});

app.patch("/api/occurrences/:id", adminOnly, (req: any, res) => {
  const { id } = req.params;
<<<<<<< HEAD
  const index = occurrences.findIndex((o) => o.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Ocorrência não encontrada" });
=======
  const index = occurrences.findIndex(o => o.id === id);
  if (index === -1) return res.status(404).json({ error: "Ocorrência não encontrada" });
>>>>>>> backend

  const oldStatus = occurrences[index].status;
  const newStatus = req.body.status;
  let action = "Edição de dados";

  if (newStatus && newStatus !== oldStatus) {
    if (newStatus === "Concluída") action = "Encerramento da ocorrência";
    else if (newStatus === "Cancelada") action = "Cancelamento da ocorrência";
  }

  const logEntry = {
    id: Date.now().toString(),
    user: req.user.name,
    action: action,
<<<<<<< HEAD
    timestamp: new Date().toISOString(),
  };

  occurrences[index] = {
    ...occurrences[index],
    ...req.body,
    auditLogs: [logEntry, ...occurrences[index].auditLogs],
=======
    timestamp: new Date().toISOString()
  };

  occurrences[index] = { 
    ...occurrences[index], 
    ...req.body,
    auditLogs: [logEntry, ...occurrences[index].auditLogs]
>>>>>>> backend
  };
  res.json(occurrences[index]);
});

app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;
<<<<<<< HEAD
  const user = users.find((u) => u.email === email);
=======
  const user = users.find(u => u.email === email);
>>>>>>> backend

  if (!user) {
    return res.status(404).json({ error: "E-mail não encontrado" });
  }

  // In a real app, send email here
  res.json({ message: "Link de recuperação enviado com sucesso" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
