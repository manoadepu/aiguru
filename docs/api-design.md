# API Design Documentation

This document outlines the API endpoints and data structures for the AI Agent Teacher application's backend API.

## Base URL

All API endpoints are relative to:
```
/api/v1
```

## Authentication

Most endpoints require JWT authentication via Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

#### `POST /auth/register`
Register a new parent user account.

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "securePassword123",
  "name": "Parent Name"
}
```

**Response:**
```json
{
  "id": "user_id",
  "email": "parent@example.com",
  "name": "Parent Name",
  "created_at": "2025-07-22T12:00:00Z"
}
```

#### `POST /auth/login`
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbG...",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "email": "parent@example.com",
    "name": "Parent Name"
  }
}
```

### Child Profiles

#### `GET /children`
Get all child profiles for authenticated parent.

**Response:**
```json
[
  {
    "id": "child_id_1",
    "name": "Child Name",
    "grade": "3rd grade",
    "subjects": ["Math", "Science"],
    "learning_style": "Visual",
    "created_at": "2025-07-22T12:00:00Z"
  }
]
```

#### `POST /children`
Create a new child profile.

**Request Body:**
```json
{
  "name": "Child Name",
  "grade": "3rd grade",
  "subjects": ["Math", "Science"],
  "learning_style": "Visual",
  "preferences": {
    "response_style": "concise",
    "examples_type": "real-world"
  }
}
```

**Response:**
```json
{
  "id": "child_id",
  "name": "Child Name",
  "grade": "3rd grade",
  "subjects": ["Math", "Science"],
  "learning_style": "Visual",
  "preferences": {
    "response_style": "concise",
    "examples_type": "real-world"
  },
  "created_at": "2025-07-22T12:00:00Z"
}
```

#### `PUT /children/{child_id}`
Update a child profile.

**Request Body:** Same as POST, with optional fields.

#### `DELETE /children/{child_id}`
Delete a child profile.

### Chat Sessions

#### `POST /children/{child_id}/sessions`
Start a new chat session.

**Request Body:**
```json
{
  "subject": "Math",
  "topic": "Addition"
}
```

**Response:**
```json
{
  "id": "session_id",
  "child_id": "child_id",
  "subject": "Math",
  "topic": "Addition",
  "started_at": "2025-07-22T12:00:00Z",
  "status": "active"
}
```

#### `GET /children/{child_id}/sessions`
Get all sessions for a child.

#### `GET /sessions/{session_id}`
Get session details and messages.

**Response:**
```json
{
  "id": "session_id",
  "child_id": "child_id",
  "subject": "Math",
  "topic": "Addition",
  "started_at": "2025-07-22T12:00:00Z",
  "status": "active",
  "messages": [
    {
      "id": "message_id_1",
      "role": "system",
      "content": "Welcome to your Math session about Addition!",
      "timestamp": "2025-07-22T12:00:00Z"
    }
  ]
}
```

### Messages

#### `POST /sessions/{session_id}/messages`
Send a message in a session.

**Request Body:**
```json
{
  "content": "What is 2+2?",
  "role": "user"
}
```

**Response:**
```json
{
  "id": "message_id",
  "session_id": "session_id",
  "role": "user",
  "content": "What is 2+2?",
  "timestamp": "2025-07-22T12:00:00Z"
}
```

#### `GET /sessions/{session_id}/messages`
Get all messages in a session.

### Quiz Generation

#### `POST /children/{child_id}/quizzes`
Generate a quiz for a specific subject/topic.

**Request Body:**
```json
{
  "subject": "Math",
  "topic": "Addition",
  "difficulty": "easy",
  "question_count": 5
}
```

**Response:**
```json
{
  "id": "quiz_id",
  "child_id": "child_id",
  "subject": "Math",
  "topic": "Addition",
  "difficulty": "easy",
  "created_at": "2025-07-22T12:00:00Z",
  "questions": [
    {
      "id": "question_id_1",
      "text": "What is 2+2?",
      "type": "multiple_choice",
      "options": ["3", "4", "5", "6"],
      "correct_answer": "4"
    },
    {
      "id": "question_id_2",
      "text": "What is 3+5?",
      "type": "multiple_choice",
      "options": ["7", "8", "9", "10"],
      "correct_answer": "8"
    }
  ]
}
```

#### `GET /children/{child_id}/quizzes`
Get all quizzes for a child.

#### `GET /quizzes/{quiz_id}`
Get a specific quiz.

### Quiz Attempts

#### `POST /quizzes/{quiz_id}/attempts`
Submit a quiz attempt.

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": "question_id_1",
      "selected_option": "4"
    },
    {
      "question_id": "question_id_2",
      "selected_option": "7"
    }
  ]
}
```

**Response:**
```json
{
  "id": "attempt_id",
  "quiz_id": "quiz_id",
  "child_id": "child_id",
  "submitted_at": "2025-07-22T12:05:00Z",
  "score": 50.0,
  "feedback": "Great job! You got addition with small numbers correct.",
  "results": [
    {
      "question_id": "question_id_1",
      "correct": true,
      "selected_option": "4",
      "correct_option": "4"
    },
    {
      "question_id": "question_id_2",
      "correct": false,
      "selected_option": "7",
      "correct_option": "8"
    }
  ]
}
```

### Feedback

#### `POST /messages/{message_id}/feedback`
Provide feedback on an AI response.

**Request Body:**
```json
{
  "rating": "thumbs_up",
  "comment": "Very helpful explanation"
}
```

**Response:**
```json
{
  "id": "feedback_id",
  "message_id": "message_id",
  "rating": "thumbs_up",
  "comment": "Very helpful explanation",
  "submitted_at": "2025-07-22T12:05:00Z"
}
```

## Data Models

### User
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "created_at": "datetime"
}
```

### Child
```json
{
  "id": "string",
  "user_id": "string",
  "name": "string",
  "grade": "string",
  "subjects": ["string"],
  "learning_style": "string",
  "preferences": {
    "response_style": "string",
    "examples_type": "string"
  },
  "created_at": "datetime"
}
```

### Session
```json
{
  "id": "string",
  "child_id": "string",
  "subject": "string",
  "topic": "string",
  "started_at": "datetime",
  "ended_at": "datetime",
  "status": "string"
}
```

### Message
```json
{
  "id": "string",
  "session_id": "string",
  "role": "string",
  "content": "string",
  "timestamp": "datetime"
}
```

### Quiz
```json
{
  "id": "string",
  "child_id": "string",
  "subject": "string",
  "topic": "string",
  "difficulty": "string",
  "created_at": "datetime",
  "questions": []
}
```

### Question
```json
{
  "id": "string",
  "quiz_id": "string",
  "text": "string",
  "type": "string",
  "options": ["string"],
  "correct_answer": "string"
}
```

### QuizAttempt
```json
{
  "id": "string",
  "quiz_id": "string",
  "child_id": "string",
  "submitted_at": "datetime",
  "score": "number",
  "feedback": "string",
  "results": []
}
```

### Feedback
```json
{
  "id": "string",
  "message_id": "string",
  "rating": "string",
  "comment": "string",
  "submitted_at": "datetime"
}
```

## Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Not authorized to access resource
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Rate Limiting

API requests are limited to 100 requests per minute per user.
OpenAI API calls are carefully managed to prevent excessive usage.
