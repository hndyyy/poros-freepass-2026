"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.router = (0, express_1.Router)();
// Dynamic DB Connection String constructed from env vars
// This allows using DB_USER, DB_PASSWORD etc from .env without a full DATABASE_URL
const dbUrl = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});
// Health Check
exports.router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
// Auth Routes
// Sign Up
exports.router.post('/auth/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ message: "Please provide all fields" });
    }
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });
        // Don't return password
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
}));
// Login
exports.router.post('/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please enter both email and password" });
    }
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json(userWithoutPassword);
    }
    catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
}));
// Tasks Routes
// Get All Tasks
exports.router.get('/tasks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tasks = yield prisma.task.findMany();
        const tasksForFrontend = tasks.map(t => {
            var _a;
            return (Object.assign(Object.assign({}, t), { createdAt: t.createdAt.getTime(), dueDate: (_a = t.dueDate) === null || _a === void 0 ? void 0 : _a.getTime(), priority: t.priority, status: t.status, subtasks: [] }));
        });
        res.json(tasksForFrontend);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
}));
// Create Task
exports.router.post('/tasks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, description, priority, status, userId } = req.body;
    if (!title || !userId) {
        return res.status(400).json({ message: "Title and UserID are required" });
    }
    try {
        const task = yield prisma.task.create({
            data: {
                title,
                description,
                priority,
                status,
                userId
            }
        });
        res.status(201).json(Object.assign(Object.assign({}, task), { createdAt: task.createdAt.getTime(), dueDate: (_a = task.dueDate) === null || _a === void 0 ? void 0 : _a.getTime(), subtasks: [] }));
    }
    catch (error) {
        res.status(500).json({ message: "Error creating task", error: error.message });
    }
}));
// Update Task
exports.router.put('/tasks/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { title, description, priority, status, userId } = req.body;
    try {
        const task = yield prisma.task.update({
            where: { id },
            data: {
                title,
                description,
                priority,
                status,
                // userId is typically not changed, but we keep the relation consistent
            }
        });
        res.json(Object.assign(Object.assign({}, task), { createdAt: task.createdAt.getTime(), dueDate: (_a = task.dueDate) === null || _a === void 0 ? void 0 : _a.getTime(), subtasks: [] }));
    }
    catch (error) {
        res.status(404).json({ message: "Task not found" });
    }
}));
// Delete Task
exports.router.delete('/tasks/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.task.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting task" });
    }
}));
