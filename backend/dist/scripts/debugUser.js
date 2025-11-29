"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = require("../config/database");
const User_1 = __importDefault(require("../models/User"));
async function debugUser() {
    await (0, database_1.connectDB)();
    const user = await User_1.default.findOne({ email: 'contributor@test.com' });
    console.log('User found:', !!user);
    if (user) {
        console.log('User details:', {
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
        });
    }
    process.exit(0);
}
debugUser();
