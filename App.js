import { StyleSheet, View, TextInput, Button, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import amplify from '@aws-amplify/core';
import config from './aws-exports';
amplify.configure(config);
import API, { graphqlOperation } from '@aws-amplify/api';

const Listbooks = `
query {
  listBooks {
    items {
      id title author
    }
  }
}
`;

const AddBook = `
mutation ($title: String! $author: String) {
  createBook(input: {
    title: $title
    author: $author
  }) {
    id title author
  }
}
`;

export default function App() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [books, setBooks] = useState([]);

  const onChangeInput = (setFunction, val) => {
    setFunction(val);
  }

  const addBook = async () => {
    if (title === '' || author === '') return;
    const book = { title: title, author: author };
    try {
      const books_added = [...books, book];
      setTitle('');
      setAuthor('');
      setBooks(books_added);
      await API.graphql(graphqlOperation(AddBook, book));
      console.log('success');
      console.log(books)
    } catch (err) {
      console.log('error: ', err);
    }
  };

  const listAllBooks = async () => {
    try {
      const booksAPI = await API.graphql(graphqlOperation(Listbooks));
      console.log('books: ', booksAPI);
      setBooks(booksAPI.data.listBooks.items);
    } catch (err) {
      console.log('error: ', err)
    }
  }

  useEffect(() => {
    listAllBooks();
  }, [])

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={val => onChangeInput(setTitle, val)}
        placeholder="What do I want to read?"
      />
      <TextInput
        style={styles.input}
        value={author}
        onChangeText={val => onChangeInput(setAuthor, val)}
        placeholder="Who wrote it?"
      />
      <Button
        onPress={addBook}
        title="Add to read"
        color='#eeaa55'
      />
      {books.map((book, index) => (
        <View key={index} style={styles.book}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
        </View>
       ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 50
  },
  input: {
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: 'blue',
    marginVertical: 10
  },
  book: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10
  },
  title: { fontSize: 16 },
  author: { color: 'rgba(0, 0, 0, .5)' }
});
