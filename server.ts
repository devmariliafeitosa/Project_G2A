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
    disciplinasMinistradas: []
  }
];

// Helper for Admin check
const adminOnly = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Não autorizado" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role === "Admin") {
      next();
    } else {
      res.status(403).json({ error: "Acesso negado: Apenas administradores" });
    }
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Auth Endpoints
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  // Login can be email, login field or registration (SIAPE)
  const user = users.find(u => u.email === email || u.login === email || u.registration === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Credenciais incorretas" });
  }

  if (user.status === "Inativo") {
    return res.status(403).json({ error: "Este usuário está desativado" });
  }

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
});

app.post("/api/refresh", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
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
    
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
});

// User Management Endpoints (Admin Only)
app.get("/api/users", adminOnly, (req, res) => {
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

app.post("/api/users", adminOnly, (req, res) => {
  const { name, email, role, registration, campus, password, birthDate, phone, areaAtuacao, cpf, login, ingressoYear } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "E-mail já cadastrado" });
  }
  if (login && users.find(u => u.login === login)) {
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
    phone,
    areaAtuacao,
    cpf,
    login,
    ingressoYear,
    status: "Ativo",
    cargaHoraria: 0,
    disciplinasMinistradas: [],
    password: bcrypt.hashSync(password || "ifce123", 10)
  };

  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

app.put("/api/users/:id", adminOnly, (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return res.status(404).json({ error: "Usuário não encontrado" });

  const { email } = req.body;
  if (email && users.find(u => u.email === email && u.id !== id)) {
    return res.status(400).json({ error: "E-mail já cadastrado" });
  }

  users[index] = { ...users[index], ...req.body };
  const { password, ...safeUser } = users[index];
  res.json(safeUser);
});

app.delete("/api/users/:id", adminOnly, (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: "Usuário não encontrado" });
  
  users.splice(index, 1);
  res.status(204).send();
});

app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);

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
