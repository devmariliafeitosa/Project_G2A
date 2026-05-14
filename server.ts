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
    name: "Administrador Geral",
    password: bcrypt.hashSync("123456", 10),
    role: "Admin",
    registration: "ADMIN01",
    campus: "Tauá"
  },
  {
    id: "1",
    email: "ricardo.silva@ifce.edu.br",
    name: "Dr. Ricardo Silva",
    password: bcrypt.hashSync("password123", 10),
    role: "Professor",
    registration: "1122334",
    campus: "Tauá"
  }
];

// Auth Endpoints
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Credenciais incorretas" });
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
    campus: user.campus
  } });
});

app.post("/api/refresh", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

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
