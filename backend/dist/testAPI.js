"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const testAPI = async () => {
    try {
        console.log('Testing destinations API...');
        const response = await (0, node_fetch_1.default)('http://localhost:5000/api/destinations');
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
            console.log('\n✅ API Response successful!');
            console.log(`📍 Found ${data.data.length} destinations`);
            // Show accommodation format for first destination
            const firstDest = data.data[0];
            console.log(`\n🏨 Accommodation format for "${firstDest.name}":`);
            console.log(JSON.stringify(firstDest.accommodation, null, 2));
            // Verify the format
            const hasNewFormat = Array.isArray(firstDest.accommodation) &&
                firstDest.accommodation.every((acc) => acc.type && acc.name && acc.description && acc.priceRange);
            if (hasNewFormat) {
                console.log('\n✅ New accommodation array format confirmed!');
                console.log('Each accommodation entry has: type, name, description, priceRange');
            }
            else {
                console.log('\n❌ Old format detected or missing fields');
            }
        }
        else {
            console.log('❌ API response failed or no data found');
            console.log(data);
        }
    }
    catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
};
testAPI();
