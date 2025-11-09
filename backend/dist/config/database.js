"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        const conn = await mongoose_1.default.connect(mongoURI, {
        // Remove deprecated options
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        // Handle connection events
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose_1.default.connection.close();
                console.log('🔒 MongoDB connection closed through app termination');
                process.exit(0);
            }
            catch (error) {
                console.error('❌ Error closing MongoDB connection:', error);
                process.exit(1);
            }
        });
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
