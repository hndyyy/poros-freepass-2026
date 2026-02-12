import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Task, User } from './types';

export const router = Router();

// Dynamic DB Connection String constructed from env vars
// This allows using DB_USER, DB_PASSWORD etc from .env without a full DATABASE_URL
const dbUrl = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});

// Health Check
router.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Auth Routes

// Sign Up
router.post('/auth/signup', async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ message: "Please provide all fields" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });
        // Don't return password
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
});

// Login
router.post('/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please enter both email and password" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error: any) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});

// Tasks Routes

// Get All Tasks
router.get('/tasks', async (req: Request, res: Response) => {
    try {
        const tasks = await prisma.task.findMany();
        const tasksForFrontend = tasks.map(t => ({
            ...t,
            createdAt: t.createdAt.getTime(),
            dueDate: t.dueDate?.getTime(),
            priority: t.priority as any,
            status: t.status as any,
            subtasks: []
        }));
        res.json(tasksForFrontend);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

// Create Task
router.post('/tasks', async (req: Request, res: Response) => {
    const { title, description, priority, status, userId } = req.body;

    if (!title || !userId) {
        return res.status(400).json({ message: "Title and UserID are required" });
    }

    try {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority,
                status,
                userId
            }
        });

        res.status(201).json({
            ...task,
            createdAt: task.createdAt.getTime(),
            dueDate: task.dueDate?.getTime(),
            subtasks: []
        });
    } catch (error: any) {
        res.status(500).json({ message: "Error creating task", error: error.message });
    }
});

// Update Task
router.put('/tasks/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, priority, status, userId } = req.body;

    try {
        const task = await prisma.task.update({
            where: { id },
            data: {
                title,
                description,
                priority,
                status,
                // userId is typically not changed, but we keep the relation consistent
            }
        });
        res.json({
            ...task,
            createdAt: task.createdAt.getTime(),
            dueDate: task.dueDate?.getTime(),
            subtasks: []
        });
    } catch (error) {
        res.status(404).json({ message: "Task not found" });
    }
});

// Delete Task
router.delete('/tasks/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.task.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error deleting task" });
    }
});
