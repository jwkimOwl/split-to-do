import { withAuthenticator, Button, Heading, View, Card, Flex, Text, TextField} from "@aws-amplify/ui-react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import './App.css';
import { Amplify, graphqlOperation} from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
//import {awsconfig} from './aws-exports';
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
import awsmobile from './aws-exports.js';
//Amplify.configure(awsconfig);
Amplify.configure(awsmobile);
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
  const client = generateClient();

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
      
      const apiData = await client.graphql({ 
        query: listTodos
        //variables: {
        //  filter: { owner: { eq: user.username } }
        //}
      });
      console.log('Todos fetched successfully:', apiData);
      const todosFromAPI = apiData.data.listTodos.items;
      setTodos(todosFromAPI);
      console.log('Todos set successfully:', todosFromAPI);
    } catch (err) {
      console.log('error fetching todos:', err);
      if (err.errors) {
        console.log('GraphQL errors:', err.errors);
      }
      setTodos([]);
    }
  }

  async function createTodo(event) {
    try {
      event.preventDefault();
      
      if (!user?.username) {
        console.log('No user found');
        return;
      }

      const form = new FormData(event.target);
      const data = {
        name: form.get("name"),
        description: form.get("description"),
        owner: user.username
      };

      console.log('Creating todo with data:', data); // Debug log

      await client.graphql({
        query: createTodoMutation,
        variables: { input: data },
      });
      console.log('Todo created successfully');

      await fetchTodos();
      event.target.reset();
    } catch (err) {
      console.error('Error creating todo:', err);
      console.error('GraphQL errors:', err.errors);
    }
  }

  async function deleteTodo({ id }) {
    const newTodo = todos.filter((todo) => todo.id !== id);
    setTodos(newTodo);
    await client.graphql({
      query: deleteTodoMutation,
      variables: { input: { id } },
    });
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
        {todos.map((todo) => (
          <Flex
            key={todo.id || todo.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {todo.name}
            </Text>
            <Text as="span">{todo.description}</Text>
            <Button variation="link" onClick={() => deleteTodo(todo)}>
              Delete todo
            </Button>
          </Flex>
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
/*await DataStore.save(
  new Todo({
  "name": "Lorem ipsum dolor sit amet",
  "description": "Lorem ipsum dolor sit amet"
})
);*/

export default withAuthenticator(App);

