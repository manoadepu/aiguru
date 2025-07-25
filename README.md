# AI Agent Teacher Application

A personalized AI-based tutor application that allows parents to create customized learning experiences for their children.

## Overview

This application enables parents to set up AI teaching agents tailored to their child's grade level, subjects of interest, and learning style. The AI agent can:

- Answer questions and explain concepts at the appropriate level
- Generate quizzes and tests with answers
- Adapt teaching style based on feedback and interaction patterns
- Track learning progress over time

## Project Structure

```
/docs         - Documentation files
/frontend     - React-based user interface
/backend      - API and business logic layer
/database     - Database schemas and migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- OpenAI API key

### Setup Instructions

1. Clone the repository
2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   - Create `.env` file in the backend directory
   - Add your OpenAI API key and database connection information
5. Start development servers:
   - Frontend: `npm start` (from frontend directory)
   - Backend: `python app.py` (from backend directory)

## Development

See the [Development Plan](/docs/development-plan.md) for detailed information about the phased approach to building this application.

## Testing

- Frontend tests: `npm test` (from frontend directory)
- Backend tests: `pytest` (from backend directory)

## License

[MIT License](LICENSE)
