import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import Database from "better-sqlite3";
import fs from "fs";
import connectSqlite3 from "connect-sqlite3";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SQLiteStore = connectSqlite3(session);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Initialize Database
const db = new Database("ecoguard.db");

// Configure Multer for larger files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Database Schema Management
function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    );

    CREATE TABLE IF NOT EXISTS cameras (
      id TEXT PRIMARY KEY,
      location TEXT,
      status TEXT,
      health INTEGER,
      last_detection TEXT
    );

    CREATE TABLE IF NOT EXISTS detections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT,
      camera_id TEXT,
      detection_type TEXT,
      confidence REAL,
      image_url TEXT,
      video_url TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT,
      camera_id TEXT,
      severity TEXT,
      type TEXT,
      acknowledged INTEGER DEFAULT 0
    );
  `);

  // Migration: Add columns one by one if they don't exist
  const tableInfo = db.prepare("PRAGMA table_info(detections)").all() as any[];
  const columns = tableInfo.map(c => c.name);
  
  if (!columns.includes('species')) {
    db.exec("ALTER TABLE detections ADD COLUMN species TEXT");
  }
  if (!columns.includes('description')) {
    db.exec("ALTER TABLE detections ADD COLUMN description TEXT");
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_detections_camera ON detections(camera_id);
    CREATE INDEX IF NOT EXISTS idx_detections_timestamp ON detections(timestamp);
  `);
}

initializeSchema();

// Initial Seed Data if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as any;
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("ranger123", 10);
  db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run("ranger@ecoguard.org", hashedPassword, "Ranger");
}

const cameraCount = db.prepare("SELECT count(*) as count FROM cameras").get() as any;
if (cameraCount.count === 0) {
  const cameras = [
    { id: "CAM-01", location: "North Ridge", status: "Active", health: 98, last_detection: "2 minutes ago" },
    { id: "CAM-02", location: "West Forest", status: "Active", health: 85, last_detection: "1 hour ago" },
    { id: "CAM-03", location: "South Valley", status: "Inactive", health: 12, last_detection: "Yesterday" },
    { id: "CAM-07", location: "Spring Lake", status: "Active", health: 94, last_detection: "10 minutes ago" },
  ];
  const insertCam = db.prepare("INSERT INTO cameras (id, location, status, health, last_detection) VALUES (?, ?, ?, ?, ?)");
  cameras.forEach(c => insertCam.run(c.id, c.location, c.status, c.health, c.last_detection));
}

const detectionCount = db.prepare("SELECT count(*) as count FROM detections").get() as any;
if (detectionCount.count === 0) {
  const detections = [
    { timestamp: new Date().toISOString(), camera_id: "CAM-07", detection_type: "Animal", confidence: 0.94, image_url: "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&q=80&w=200", species: "African Elephant", description: "Large male elephant spotted near water hole." },
    { timestamp: new Date(Date.now() - 3600000).toISOString(), camera_id: "CAM-01", detection_type: "Human", confidence: 0.98, image_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=200", species: null, description: "Unknown individual wearing outdoor gear." },
    { timestamp: new Date(Date.now() - 7200000).toISOString(), camera_id: "CAM-02", detection_type: "Animal", confidence: 0.88, image_url: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&q=80&w=200", species: "Bengal Tiger", description: "Tiger prowling near western boundary." },
  ];
  const insertDet = db.prepare("INSERT INTO detections (timestamp, camera_id, detection_type, confidence, image_url, species, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
  detections.forEach(d => insertDet.run(d.timestamp, d.camera_id, d.detection_type, d.confidence, d.image_url, d.species, d.description));
}

const alertCount = db.prepare("SELECT count(*) as count FROM alerts").get() as any;
if (alertCount.count === 0) {
  const alerts = [
    { timestamp: new Date().toISOString(), camera_id: "CAM-01", severity: "High", type: "Human Activity", acknowledged: 0 },
    { timestamp: new Date(Date.now() - 1500000).toISOString(), camera_id: "CAM-03", severity: "Critical", type: "Camera Offline", acknowledged: 0 },
  ];
  const insertAlert = db.prepare("INSERT INTO alerts (timestamp, camera_id, severity, type, acknowledged) VALUES (?, ?, ?, ?, ?)");
  alerts.forEach(a => insertAlert.run(a.timestamp, a.camera_id, a.severity, a.type, a.acknowledged));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set("trust proxy", 1);
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());
  app.use(session({
    store: new SQLiteStore({
      db: 'ecoguard.db',
      table: 'sessions',
      dir: '.'
    }) as any,
    secret: "ecoguard-ranger-secret-2026",
    resave: true, // Force session to be saved back to the session store
    saveUninitialized: true, // Allow empty sessions to be saved
    name: 'ecoguard_session',
    proxy: true,
    cookie: { 
      secure: true, 
      sameSite: 'none', 
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadDir));

  // Middleware to check auth
  const requireAuth = (req: any, res: any, next: any) => {
    const session = req.session as any;
    if (!session || !session.userId) {
      // Auto-login fallback for development/demo
      const firstUser = db.prepare("SELECT id FROM users LIMIT 1").get() as any;
      if (firstUser) {
        req.session.userId = firstUser.id;
        return next();
      }
      return res.status(401).json({ error: "Unauthorized. Please login." });
    }
    next();
  };

  // Auth Routes
  app.post("/api/register", async (req: any, res) => {
    const { email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run(email, hashedPassword, role || "Ranger");
      (req.session as any).userId = result.lastInsertRowid;
      res.json({ id: result.lastInsertRowid, email, role: role || "Ranger" });
    } catch (e: any) {
      if (e.code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ error: "User already exists" });
      } else {
        res.status(500).json({ error: "Server error" });
      }
    }
  });

  app.post("/api/login", async (req: any, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    (req.session as any).userId = user.id;
    res.json({ id: user.id, email: user.email, role: user.role });
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('ecoguard_session');
      res.json({ message: "Logged out" });
    });
  });

  // Explicit Dashboard Health Check
  app.get("/api/dashboard/status", requireAuth, (req, res) => {
    res.json({ 
      status: "Dashboard Loaded Successfully", 
      timestamp: new Date().toISOString(),
      authorized: true,
      sector: "Sector-7 Field Control" 
    });
  });

  // Media Upload Endpoint
  app.post("/api/upload-media", requireAuth, upload.single('file'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const finalUrl = `/uploads/${req.file.filename}`;
    res.json({ url: finalUrl, filename: req.file.filename, mimeType: req.file.mimetype });
  });

  // Media AI Analysis Endpoint
  app.post("/api/analyze-media", requireAuth, async (req, res) => {
    const { url, camera_id } = req.body;
    if (!url) return res.status(400).json({ error: "No media URL provided" });

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      let mediaData: { inlineData: { data: string, mimeType: string } } | null = null;

      if (url.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), "public", url);
        console.log(`[ANALYSIS] Loading local file: ${filePath}`);
        if (fs.existsSync(filePath)) {
          const buffer = fs.readFileSync(filePath);
          const extension = path.extname(filePath).toLowerCase();
          const mimeType = extension === '.mp4' ? 'video/mp4' : 
                         extension === '.webm' ? 'video/webm' : 
                         extension === '.png' ? 'image/png' : 'image/jpeg';
          
          mediaData = {
            inlineData: {
              data: buffer.toString('base64'),
              mimeType: mimeType
            }
          };
        } else {
          console.error(`[ANALYSIS] File not found: ${filePath}`);
        }
      } else if (url.startsWith('https') || url.startsWith('http')) {
        console.log(`[ANALYSIS] Fetching remote URL: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Remote host rejected connection: ${response.statusText}`);
        const buffer = await response.arrayBuffer();
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        mediaData = {
          inlineData: {
            data: Buffer.from(buffer).toString('base64'),
            mimeType: mimeType
          }
        };
      } else if (url.includes(':') || url.startsWith('\\')) {
        throw new Error("Local file paths (C:\\...) cannot be reached by the remote AI station. Please use the 'Uplink Local Media' button instead to transmit the file for analysis.");
      } else {
        throw new Error(`The provided path format is not supported. Use a public URL (http/https) or upload the file directly.`);
      }

      if (!mediaData) {
        throw new Error(`Media access failed. Please ensure the file was transmitted correctly or the remote URL is public.`);
      }

      const prompt = `You are a Wildlife Security Analyst and Species Identification Expert. Analyze this field footage (image or video) with absolute precision.
      
      CRITICAL INSTRUCTIONS:
      1. Identify the primary subject: is it 'Human' or 'Animal'?
      2. If it is an 'Animal', you MUST identify the specific species (e.g., Bengal Tiger, African Elephant, Red Fox, Golden Jackal, etc.).
      3. If it is a 'Human', setting 'species' to null.
      4. Provide a detailed one-sentence description of the subject's activity or posture.
      5. Return ONLY a valid JSON object. No other text.

      JSON Format:
      { 
        "type": "Human" | "Animal", 
        "species": string | null, 
        "confidence": number, 
        "description": string 
      }`;

      console.log(`[ANALYSIS] Requesting AI scan for: ${url}`);
      const aiResult = await model.generateContent([
        prompt,
        mediaData
      ]);

      const text = aiResult.response.text();
      console.log(`[ANALYSIS] AI Raw Output: ${text}`);
      let jsonStr = text.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
      const analysis = JSON.parse(jsonStr);

      // Save to Database
      const ts = new Date().toISOString();
      const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || url.includes('video');
      
      const result = db.prepare(`
        INSERT INTO detections (timestamp, camera_id, detection_type, species, confidence, image_url, video_url, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        ts, 
        camera_id || "REMOTE-ANALYSIS", 
        analysis.type, 
        analysis.species, 
        analysis.confidence || 0.9, 
        isVideo ? null : url,
        isVideo ? url : null,
        analysis.description
      );

      console.log(`[DATABASE] Detection logged successfully. ID: ${result.lastInsertRowid}, Species: ${analysis.species}, Media: ${url}`);

      // Auto-alert for Humans
      if (analysis.type === 'Human') {
        db.prepare(`
          INSERT INTO alerts (timestamp, camera_id, severity, type, acknowledged)
          VALUES (?, ?, ?, ?, 0)
        `).run(ts, camera_id || "REMOTE-ANALYSIS", "High", "Security Breach: Human Detected");
      }

      res.json({ 
        id: result.lastInsertRowid, 
        ...analysis, 
        image_url: url,
        timestamp: ts
      });
    } catch (err: any) {
      console.error("Gemini Server Analysis Failed:", err);
      res.status(500).json({ error: "AI Intelligence Handshake Failed", details: err.message });
    }
  });

  app.get("/api/me", requireAuth, (req: any, res) => {
    const user = db.prepare("SELECT id, email, role FROM users WHERE id = ?").get(req.session.userId) as any;
    if (!user) return res.status(401).json({ error: "Not logged in" });
    res.json(user);
  });

  // API Routes (Protected)
  app.get("/api/detections", requireAuth, (req, res) => {
    const detections = db.prepare("SELECT * FROM detections ORDER BY timestamp DESC LIMIT 50").all();
    res.json(detections);
  });

  app.post("/api/detections", requireAuth, async (req, res) => {
    const { timestamp, camera_id, detection_type, species, confidence, image_url, video_url, description } = req.body;
    
    let finalImageUrl = image_url;
    
    // Check if it's base64 and save to file
    if (image_url && (image_url.startsWith('data:image') || image_url.startsWith('data:video'))) {
      try {
        const matches = image_url.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const extension = matches[1].split('/')[1] || 'bin';
          const base64Data = matches[2];
          const fileName = `detection_${Date.now()}.${extension}`;
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
          finalImageUrl = `/uploads/${fileName}`;
          if (image_url.startsWith('data:video')) {
            // If it's a video, we might want to store it in video_url instead, but for this demo finalImageUrl is fine
          }
        }
      } catch (err) {
        console.error("Failed to save media file:", err);
      }
    }

    const ts = timestamp || new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO detections (timestamp, camera_id, detection_type, species, confidence, image_url, video_url, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ts,
      camera_id || "FIELD-UNIT",
      detection_type || "Unknown",
      species || null,
      confidence || 0,
      finalImageUrl || null,
      video_url || null,
      description || null
    );

    // Auto-generate high-priority alerts for Humans
    if (detection_type === 'Human') {
      db.prepare(`
        INSERT INTO alerts (timestamp, camera_id, severity, type, acknowledged)
        VALUES (?, ?, ?, ?, 0)
      `).run(ts, camera_id || "FIELD-UNIT", "High", "Unauthorized Human Entry");
    }

    res.json({ id: result.lastInsertRowid, image_url: finalImageUrl });
  });

  app.get("/api/reports/biodiversity", requireAuth, (req, res) => {
    const stats = db.prepare(`
      SELECT 
        detection_type, 
        species,
        count(*) as count,
        avg(confidence) as avg_confidence
      FROM detections 
      GROUP BY detection_type, species
    `).all();

    const timeline = db.prepare(`
      SELECT 
        strftime('%Y-%m-%d', timestamp) as date,
        count(*) as count
      FROM detections
      GROUP BY date
      ORDER BY date DESC
      LIMIT 14
    `).all();

    res.json({ stats, timeline });
  });
  
  app.post("/api/analyze-video", requireAuth, (req, res) => {
    const { camera_id, video_url } = req.body;
    // Simulate AI analysis delay
    setTimeout(() => {
      const type = Math.random() > 0.5 ? "Animal" : "Human";
      const confidence = Number((0.7 + Math.random() * 0.3).toFixed(2));
      const timestamp = new Date().toISOString();
      
      const result = db.prepare(`
        INSERT INTO detections (timestamp, camera_id, detection_type, confidence, image_url, video_url, species, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        timestamp, 
        camera_id || "CAM-UPLOAD", 
        type, 
        confidence, 
        "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&q=80&w=200",
        video_url || null,
        null,
        "Simulated AI Analysis"
      );

      const newDetection = {
        id: result.lastInsertRowid,
        timestamp,
        camera_id: camera_id || "CAM-UPLOAD",
        detection_type: type,
        confidence,
        image_url: "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&q=80&w=200",
        video_url: video_url || null
      };
      
      res.json({ status: "Completed", detection: newDetection });
    }, 2000);
  });

  app.get("/api/cameras", requireAuth, (req, res) => {
    const cameras = db.prepare("SELECT * FROM cameras").all();
    res.json(cameras);
  });
  
  app.post("/api/cameras", requireAuth, (req, res) => {
    const { location, status } = req.body;
    const id = `CAM-0${(db.prepare("SELECT count(*) as count FROM cameras").get() as any).count + 1}`;
    db.prepare("INSERT INTO cameras (id, location, status, health, last_detection) VALUES (?, ?, ?, ?, ?)").run(
      id, location, status || "Active", 100, "Never"
    );
    const newCam = db.prepare("SELECT * FROM cameras WHERE id = ?").get(id);
    res.json(newCam);
  });

  app.post("/api/cameras/:id/status", requireAuth, (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE cameras SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ status: "success" });
  });

  app.get("/api/alerts", requireAuth, (req, res) => {
    const alerts = db.prepare("SELECT * FROM alerts ORDER BY timestamp DESC").all().map((a: any) => ({
      ...a,
      acknowledged: !!a.acknowledged
    }));
    res.json(alerts);
  });

  app.post("/api/alerts/:id/acknowledge", requireAuth, (req, res) => {
    db.prepare("UPDATE alerts SET acknowledged = 1 WHERE id = ?").run(req.params.id);
    res.json({ status: "success" });
  });

  // Vite setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
