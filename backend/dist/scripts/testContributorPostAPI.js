"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testContributorPostAPI = testContributorPostAPI;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST
dotenv_1.default.config();
async function testContributorPostAPI() {
    try {
        console.log('🧪 Testing Contributor Post Creation API...\n');
        // First, let's login as admin to create a contributor user
        console.log('📝 Step 1: Login as admin to create contributor...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@yourdomain.com',
                password: 'admin123456'
            })
        });
        if (!loginResponse.ok) {
            const error = await loginResponse.json();
            console.error('❌ Admin login failed:', error);
            return;
        }
        const adminAuth = await loginResponse.json();
        console.log('✅ Admin logged in successfully');
        // Create a contributor user
        console.log('📝 Step 2: Creating contributor user...');
        const createUserResponse = await fetch('http://localhost:5000/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminAuth.token}`
            },
            body: JSON.stringify({
                name: 'Test Contributor',
                email: 'contributor@test.com',
                password: 'password123',
                role: 'contributor'
            })
        });
        let contributorToken;
        if (createUserResponse.ok) {
            console.log('✅ Contributor user created');
        }
        else {
            console.log('ℹ️ Contributor user might already exist');
        }
        // Login as contributor
        console.log('📝 Step 3: Login as contributor...');
        const contributorLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'contributor@test.com',
                password: 'password123'
            })
        });
        if (!contributorLoginResponse.ok) {
            const error = await contributorLoginResponse.json();
            console.error('❌ Contributor login failed:', error);
            return;
        }
        const contributorAuth = await contributorLoginResponse.json();
        contributorToken = contributorAuth.token;
        console.log('✅ Contributor logged in successfully');
        // Create a post as contributor
        console.log('📝 Step 4: Creating post as contributor...');
        const postData = {
            title: 'Test Post from Contributor - ' + new Date().toISOString(),
            excerpt: 'This is a test post submitted by a contributor for review.',
            content: '<p>This is the content of the test post. It contains some sample content to test the email notification functionality.</p>',
            categories: [],
            status: 'pending',
            contentSections: []
        };
        console.log('🔄 Sending POST request to /api/contributor/posts...');
        console.log('📧 Watch backend logs for email notification...\n');
        const createPostResponse = await fetch('http://localhost:5000/api/contributor/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${contributorToken}`
            },
            body: JSON.stringify(postData)
        });
        if (createPostResponse.ok) {
            const result = await createPostResponse.json();
            console.log('✅ Post created successfully:', result.message);
            console.log('📧 Email notification should have been sent to admin');
            console.log('📝 Post ID:', result.data._id);
            console.log('📊 Post Status:', result.data.status);
        }
        else {
            const error = await createPostResponse.json();
            console.error('❌ Post creation failed:', error);
        }
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}
// Run the test
if (require.main === module) {
    testContributorPostAPI();
}
