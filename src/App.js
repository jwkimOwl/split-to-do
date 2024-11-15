import { withAuthenticator, Button, Heading, View, Card } from "@aws-amplify/ui-react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import "@aws-amplify/ui-react/styles.css";
import './App.css';

// Navigation component
function NavMenu() {
  return (
    <nav style={{
      padding: '1rem',
      backgroundColor: '#f0f0f0',
      marginBottom: '1rem'
    }}>
      <Link to="/home" style={{ marginRight: '1rem' }}>Home</Link>
      <Link to="/todos" style={{ marginRight: '1rem' }}>Todos</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}

// Existing HomePage component
function HomePage({ signOut }) {
  return (
    <View className="App">
      <Card>
        <Heading level={1}>Welcome to Your App!</Heading>
        <Button onClick={signOut}>Sign Out</Button>
      </Card>
    </View>
  );
}

// New TodosPage component
function TodosPage() {
  return (
    <View className="App">
      <Card>
        <Heading level={1}>Your Todos</Heading>
        {/* Todo list implementation will go here */}
        <p>Todo list coming soon!</p>
      </Card>
    </View>
  );
}

// New ProfilePage component
function ProfilePage({ signOut }) {
  return (
    <View className="App">
      <Card>
        <Heading level={1}>Your Profile</Heading>
        <Button onClick={signOut}>Sign Out</Button>
      </Card>
    </View>
  );
}

function App({ signOut }) {
  return (
    <Router>
      <div>
        <div className="App">
          <div className="login-container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
          margin: '20px auto',
          maxWidth: '300px',
          border: '1px solid #ccc',
          borderRadius: '5px'
        }}>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="User ID"
            style={{
              margin: '10px 0',
              padding: '8px',
              width: '100%'
            }}
          />
          <input
            type="password"
            placeholder="Password" 
            style={{
              margin: '10px 0',
              padding: '8px',
              width: '100%'
            }}
          />
          <button
            style={{
              backgroundColor: '#61dafb',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
            onClick={() => {
              
              // Add login logic here
              console.log('Login clicked');
            }}
          >
            Login
          </button>
        </div>
      </div>

        <NavMenu />
        <Routes>
          <Route path="/home" element={<HomePage signOut={signOut} />} />
          <Route path="/todos" element={<TodosPage />} />
          <Route path="/profile" element={<ProfilePage signOut={signOut} />} />
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default withAuthenticator(App);
