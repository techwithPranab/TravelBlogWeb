"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./config/database");
const User_1 = __importDefault(require("./models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createAdminUser = async () => {
    try {
        await (0, database_1.connectDB)();
        // Check if admin user already exists
        const existingAdmin = await User_1.default.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }
        // Create admin user
        const adminUser = new User_1.default({
            name: 'Admin User',
            email: 'admin@travelblog.com',
            password: 'admin123',
            role: 'admin',
            isEmailVerified: true
        });
        await adminUser.save();
        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@travelblog.com');
        console.log('Password: admin123');
        console.log('Role: admin');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};
createAdminUser();
