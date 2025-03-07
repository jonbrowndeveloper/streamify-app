# Movie Streaming App Backend

## Overview
This is the backend for the Movie Streaming Application built using Node.js, Express, and PostgreSQL. The backend handles video metadata management, user authentication, and video streaming capabilities.

## Features
- RESTful API for managing videos
- Integration with OMDB API for movie data
- User authentication and authorization
- Video streaming capabilities

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- PostgreSQL (version 12 or higher)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd movie-streaming-app/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the PostgreSQL database:
   - Create a new database for the application.
   - Update the database connection settings in your environment variables or configuration files.

4. Run database migrations (if applicable):
   ```
   npm run migrate
   ```

### Running the Application
To start the server, run:
```
npm start
```
The server will be running on `http://localhost:3000` (or the specified port in your configuration).

### API Endpoints
- `GET /api/videos` - Retrieve all videos
- `GET /api/videos/:id` - Retrieve a video by ID
- `POST /api/videos` - Create a new video
- `PUT /api/videos/:id` - Update a video by ID
- `DELETE /api/videos/:id` - Delete a video by ID

### Authentication
The application uses JWT for user authentication. Ensure to include the token in the Authorization header for protected routes.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.