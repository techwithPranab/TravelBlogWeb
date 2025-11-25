// Simple API test utility for debugging
export const testAPI = async () => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL
  
  if (!baseURL) {
    console.error('NEXT_PUBLIC_API_URL environment variable is not set')
    return
  }
  
  console.log('Testing API connection...')
  console.log('Base URL:', baseURL)
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${baseURL.replace('/api', '')}/health`)
    console.log('Health check status:', healthResponse.status)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text()
      console.log('Health response:', healthData)
    }
    
    // Test auth registration
    const testUser = {
      name: 'Frontend Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'Test123456'
    }
    
    console.log('Testing registration with:', testUser)
    
    const registerResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...testUser,
        role: 'contributor'
      }),
    })
    
    console.log('Register response status:', registerResponse.status)
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json()
      console.log('Registration successful:', registerData)
      
      // Test login
      const loginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      })
      
      console.log('Login response status:', loginResponse.status)
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        console.log('Login successful:', loginData)
        
        // Test /me endpoint
        const meResponse = await fetch(`${baseURL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${loginData.token}`,
          },
        })
        
        console.log('Me endpoint status:', meResponse.status)
        
        if (meResponse.ok) {
          const meData = await meResponse.json()
          console.log('Me endpoint successful:', meData)
        } else {
          console.error('Me endpoint failed:', await meResponse.text())
        }
      } else {
        console.error('Login failed:', await loginResponse.text())
      }
    } else {
      console.error('Registration failed:', await registerResponse.text())
    }
  } catch (error) {
    console.error('API test failed:', error)
  }
}

// Export for console usage
if (typeof window !== 'undefined') {
  (window as any).testAPI = testAPI
}
