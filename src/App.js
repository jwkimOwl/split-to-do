import { withAuthenticator, Button, Heading, View, Card, Flex, Text, TextField} from "@aws-amplify/ui-react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import './App.css';
import { Amplify, graphqlOperation } from 'aws-amplify';
import {awsconfig} from './aws-exports';
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
import config from './aws-exports.js';
Amplify.configure(awsconfig);
Amplify.configure(config)


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
  const client = generateClient();

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const apiData = await client.graphql({ query: listTodos });
    const todosFromAPI = apiData.data.listTodos.items;
    setTodos(todosFromAPI);
  }

  async function createTodo(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
    };
    await client.graphql({
      query: createTodoMutation,
      variables: { input: data },
    });
    fetchTodos();
    event.target.reset();
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
          <Route path="/todos" element={<TodosPage />} />
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

export default withAuthenticator(App);
