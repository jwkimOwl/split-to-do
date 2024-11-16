import { withAuthenticator, Button, Heading, View, Card, Flex, Text, TextField, Divider } from "@aws-amplify/ui-react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import './App.css';
import { Amplify, graphqlOperation} from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import awsmobile from './aws-exports.js';
import { generateClient } from 'aws-amplify/api';
import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { listTodos } from "./graphql/queries";
import {
  createTodo as createTodoMutation,
  deleteTodo as deleteTodoMutation,
} from "./graphql/mutations";
import logo from "./logo.svg";
import { DataStore } from 'aws-amplify/datastore';
import { Todo } from './models';
//import awsmobile from './aws-exports.js';
//import amplifyconfig from './amplifyconfiguration.json';
//Amplify.configure(amplifyconfig);
Amplify.configure({
  ...awsmobile,
  API: {
    GraphQL: {
      endpoint: awsmobile.aws_appsync_graphqlEndpoint,
      region: awsmobile.aws_appsync_region,
      defaultAuthMode: 'AMAZON_COGNITO_USER_POOLS',
      apiKey: awsmobile.aws_appsync_apiKey // Add this line
    }
  }
});
//Amplify.configure(awsmobile);
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
function TodosPage({signOut}) {
  const [todos, setTodos] = useState([]);
  const [user, setUser] = useState(null);
  const client = generateClient({ authMode: 'AMAZON_COGNITO_USER_POOLS' });

  // Separate useEffect for fetching user
  useEffect(() => {
    fetchUser();
  }, []);

  // Separate useEffect for fetching todos that depends on user
  useEffect(() => {
    if (user) {  // Only fetch todos when we have user data
      fetchTodos();
    }
  }, [user]);  // Add user as a dependency

  async function fetchUser() {
    try {
      const currentUser = await getCurrentUser();
      console.log('Current user data:', currentUser);
      const userData = {
        username: currentUser.username,
        userId: currentUser.userId
      };
      setUser(userData);
    } catch (err) {
      console.log('error fetching user', err);
    }
  }

  async function fetchTodos() {
    try {
      if (!user?.username) {
        console.log('No user data available yet');
        return;
      }
      
      console.log('Fetching todos for user:', user.username);
      
      const apiData = await client.graphql({ 
        query: listTodos,
        authMode: 'AMAZON_COGNITO_USER_POOLS',  // Explicitly set auth mode
        variables: {
          filter: {
            _deleted: { ne: true },
            owner: { eq: user.username }
          }
        }
      });

      console.log('API Response:', apiData);  // Debug log

      if (apiData.errors) {
        console.error('GraphQL Errors:', apiData.errors);
        throw new Error(apiData.errors[0].message);
      }

      const todosFromAPI = apiData.data.listTodos.items;
      // Additional filter to ensure no deleted items
      const activeTodos = todosFromAPI.filter(todo => 
        !todo._deleted && todo.owner === user.username
      );
      
      console.log('Todos fetched successfully:', activeTodos);
      setTodos(activeTodos);

    } catch (err) {
      console.log('error fetching todos:', err);
      if (err.errors) {
        err.errors.forEach(error => {
          console.error('GraphQL error:', {
            message: error.message,
            type: error.errorType,
            path: error.path
          });
        });
      }
      setTodos([]);
    }
  }

  async function createTodo(event) {
    try {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      owner: user.username
    };
    console.log('Current user:', user);
    console.log('Creating todo with data:', data);
      const result =await client.graphql({
        query: createTodoMutation,
        variables: { input: data,
          condition: null,
          _version: 1
        },
      });
      if (result.errors) {
        console.error('GraphQL Errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      if (result.data?.createTodo) {
        console.log('Todo created:', result.data.createTodo);
        await fetchTodos();
        event.target.reset();
      }
    } catch (err) {
      console.error('Detailed error:', err);
      if (err.errors) {
        err.errors.forEach(error => {
          console.error('GraphQL error:', {
            message: error.message,
            type: error.errorType,
            path: error.path
          });
        });
      }
    }
  }

  async function deleteTodo(event) {
    const targetid = event.id;
    console.log('Deleting todo with id:', targetid);
    const newTodo = todos.filter((todo) => todo.id !== targetid);
    console.log('New todo list:', newTodo);
    setTodos(newTodo);
    console.log('Deleting todo from API');
    try {
      await client.graphql({
        query: deleteTodoMutation,
        variables: { 
          input: { 
            id: targetid,
            _version:1
          }
        },
    });
    } catch (error) {
      console.log('Error deleting todo:', error);
    }
  }
  return (
    <View className="App">
      <Heading level={1}>My Todo App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createTodo}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Todo Name"
            label="Todo Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Todo Description"
            label="Todo Description"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create Todo
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Todos</Heading>
      <View margin="3rem 0">
        {todos.map((todo, index) => (
          <View key={todo.id || todo.name}>
            <Flex
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              padding="1rem"
            >
              <Flex
                direction="column"
                alignItems="flex-start"
                gap="0.5rem"
              >
                <Text as="strong" fontWeight={700}>
                  {todo.name}
                </Text>
                <Text as="span">
                  {todo.description}
                </Text>
              </Flex>
              <Button variation="link" onClick={() => deleteTodo(todo)}>
                Delete todo
              </Button>
            </Flex>
            {index < todos.length - 1 && (
              <Divider orientation="horizontal" />
            )}
          </View>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
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
        <NavMenu />
        <Routes>
          <Route path="/home" element={<HomePage signOut={signOut} />} />
          <Route path="/todos" element={<TodosPage signOut={signOut} />} />
          <Route path="/profile" element={<ProfilePage signOut={signOut} />} />
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
    </Router>
  );
}
await DataStore.save(
  new Todo({
  "name": "Lorem ipsum dolor sit amet",
  "description": "Lorem ipsum dolor sit amet"
})
);
console.log(awsmobile);
export default withAuthenticator(App);

