// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data;
    // Create new post
    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;
    // Find post with matching id
    const post = posts[postId];
    // Add new comment to post
    post.comments.push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;
    // Find post with matching id
    const post = posts[postId];
    // Find comment with matching id
    const comment = post.comments.find((comment) => comment.id === id);
    // Update comment content and status
    comment.content = content;
    comment.status = status;
  }
};

// Route handlers
app.get('/posts', (req, res) => {
  // Send posts object
  res.send(posts);
});

// Event handler
app.post('/events', (req, res) => {
  // Get type and data from event
  const { type, data } = req.body;

  // Handle event
  handleEvent(type, data);

  // Respond
  res.send({});
});

// Start server
app.listen(4002, async () => {
  console.log('Listening on port 4002');
  // Get all events from event bus
  const res = await axios.get('http://event-bus-srv:4005/events');
  // Loop through events and handle them
  for (let event of res.data) {
    console.log('Processing event:', event.type);
    handleEvent(event.type, event.data);
  }
});