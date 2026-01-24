"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Itinerary_1 = __importDefault(require("../models/Itinerary"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
/**
 * Migration script to create free subscriptions for existing users
 * and update existing itineraries to use the new multi-destination schema
 */
const runMigrations = async () => {
    try {
        console.log('Starting migration...');
        // Migration 1: Create free subscriptions for users who don't have one
        console.log('Migration 1: Creating free subscriptions for existing users...');
        const usersWithoutSubscriptions = await User_1.default.find({
            _id: {
                $nin: await Subscription_1.default.distinct('userId')
            }
        });
        console.log(`Found ${usersWithoutSubscriptions.length} users without subscriptions`);
        for (const user of usersWithoutSubscriptions) {
            try {
                await Subscription_1.default.createFreeSubscription(user._id);
                console.log(`Created free subscription for user: ${user.email}`);
            }
            catch (error) {
                console.error(`Failed to create subscription for user ${user.email}:`, error);
            }
        }
        // Migration 2: Update existing itineraries to use destinations array
        console.log('Migration 2: Updating existing itineraries to multi-destination format...');
        const itinerariesToUpdate = await Itinerary_1.default.find({
            destinations: { $exists: false },
            destination: { $exists: true }
        });
        console.log(`Found ${itinerariesToUpdate.length} itineraries to update`);
        for (const itinerary of itinerariesToUpdate) {
            try {
                // Convert single destination to array
                if (itinerary.destination) {
                    itinerary.destinations = [itinerary.destination];
                }
                else {
                    itinerary.destinations = [];
                }
                // Set default values for new fields
                if (!itinerary.adults)
                    itinerary.adults = 2;
                if (!itinerary.children)
                    itinerary.children = 0;
                // Remove old destination field
                itinerary.destination = undefined;
                await itinerary.save();
                console.log(`Updated itinerary: ${itinerary.title}`);
            }
            catch (error) {
                console.error(`Failed to update itinerary ${itinerary._id}:`, error);
            }
        }
        // Migration 3: Update itineraries that already have destinations array but missing person counts
        console.log('Migration 3: Adding default person counts to existing itineraries...');
        const itinerariesWithoutPersonCounts = await Itinerary_1.default.find({
            $or: [
                { adults: { $exists: false } },
                { children: { $exists: false } }
            ]
        });
        console.log(`Found ${itinerariesWithoutPersonCounts.length} itineraries without person counts`);
        for (const itinerary of itinerariesWithoutPersonCounts) {
            try {
                if (!itinerary.adults)
                    itinerary.adults = 2;
                if (!itinerary.children)
                    itinerary.children = 0;
                await itinerary.save();
                console.log(`Added person counts to itinerary: ${itinerary.title}`);
            }
            catch (error) {
                console.error(`Failed to add person counts to itinerary ${itinerary._id}:`, error);
            }
        }
        console.log('Migration completed successfully!');
    }
    catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};
exports.runMigrations = runMigrations;
// Run migration if this file is executed directly
if (require.main === module) {
    mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-blog')
        .then(async () => {
        console.log('Connected to MongoDB');
        await (0, exports.runMigrations)();
        process.exit(0);
    })
        .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
}
exports.default = exports.runMigrations;
