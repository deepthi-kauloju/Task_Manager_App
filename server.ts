// @ts-nocheck
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// --- CONFIGURATION ---
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const app = express();

// --- SWAGGER SETUP ---
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'API for MERN Task Manager',
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [{
        bearerAuth: []
    }]
  },
  apis: ['server.ts'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- MONGOOSE SCHEMAS ---
const SubtaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
  dueDate: { type: Date },
  completedAt: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  subtasks: [SubtaskSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'createdAt' } });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// --- VIRTUALS FOR ID ---
// Create a virtual 'id' property that gets the hex string version of the '_id'
TaskSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
UserSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
SubtaskSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtuals are included in JSON output
TaskSchema.set('toJSON', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });
SubtaskSchema.set('toJSON', { virtuals: true });

// --- MODELS FROM SCHEMAS ---
const Task = mongoose.model('Task', TaskSchema);
const User = mongoose.model('User', UserSchema);


// --- AUTH MIDDLEWARE ---
interface AuthRequest extends Request {
  user?: { id: string };
}
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });
  
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Malformed token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};


// --- API ROUTES ---

// == AUTH ROUTES ==
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: "User registered successfully" }
 *       400: { description: "User already exists or bad request" }
 */
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const payload = { id: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const { password: _, ...userResponse } = user.toObject({ virtuals: true });
    res.status(201).json({ token, user: userResponse });
  } catch (err) { res.status(500).send('Server error'); }
});
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: "Login successful" }
 *       400: { description: "Invalid credentials" }
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const payload = { id: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const { password: _, ...userResponse } = user.toObject({ virtuals: true });
    res.json({ token, user: userResponse });
  } catch (err) { res.status(500).send('Server error'); }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the logged in user's data
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: "User data returned" }
 *       401: { description: "Not authorized" }
 */
app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.toObject({ virtuals: true }));
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// == TASK ROUTES ==
/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the logged in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: "A list of tasks" }
 *       401: { description: "Not authorized" }
 */
app.get('/api/tasks', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks.map(t => t.toObject({ virtuals: true })));
  } catch (err) { res.status(500).send('Server Error'); }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                title: { type: string }
 *                description: { type: string }
 *                dueDate: { type: string, format: date-time }
 *                priority: { type: string, enum: [low, medium, high] }
 *     responses:
 *       201: { description: "Task created" }
 */
app.post('/api/tasks', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, description, dueDate, priority, subtasks } = req.body;
  try {
    const newTask = new Task({
      title, description, dueDate, priority, subtasks,
      user: req.user.id,
    });
    const task = await newTask.save();
    res.status(201).json(task.toObject({ virtuals: true }));
  } catch (err) { res.status(500).send('Server Error'); }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: "Task updated" }
 *       404: { description: "Task not found" }
 */
app.put('/api/tasks/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    // Handle subtask 'id' which is assigned on the frontend
    if(req.body.subtasks) {
      req.body.subtasks = req.body.subtasks.map(st => ({
        title: st.title,
        isCompleted: st.isCompleted,
        // if subtask has mongo _id use it, otherwise it's a new one
        _id: st._id || new mongoose.Types.ObjectId()
      }))
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updatedTask.toObject({ virtuals: true }));
  } catch (err) { res.status(500).send('Server Error'); }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Task deleted" }
 *       404: { description: "Task not found" }
 */
app.delete('/api/tasks/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await task.deleteOne();
    res.json({ id: req.params.id, message: 'Task removed' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// --- SERVE FRONTEND ---
// Serve static files from the root directory (where index.html is)
app.use(express.static(path.join(__dirname)));

// For any other request, serve the index.html file for the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// --- START SERVER ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
