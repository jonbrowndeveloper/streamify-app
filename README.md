# Movie Streaming Application

This is a full-stack movie streaming application built using Next.js for the frontend and Node.js with Express for the backend. The application utilizes PostgreSQL as the database and incorporates various features for video streaming and management.

## Features

- User authentication
- Video metadata management
- Video streaming capabilities
- Responsive UI using Material UI
- RESTful API for video operations

## Technologies Used

- **Frontend**: Next.js, Material UI, TypeScript
- **Backend**: Node.js, Express, TypeScript, Sequelize
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js

## Project Structure

```
movie-streaming-app
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── styles
│   │   ├── utils
│   │   └── types
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd movie-streaming-app
   ```

2. Set up the backend:
   - Navigate to the backend directory:
     ```
     cd backend
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Configure your PostgreSQL database in the environment variables.

3. Set up the frontend:
   - Navigate to the frontend directory:
     ```
     cd ../frontend
     ```
   - Install dependencies:
     ```
     npm install
     ```

### Running the Application

- To start the backend server:
  ```
  cd backend
  npm run start
  ```

- To start the frontend application:
  ```
  cd frontend
  npm run dev
  ```

### Docker Setup

To run the application using Docker, you can use the provided `docker-compose.yml` file. Run the following command in the root directory of the project:

```
docker-compose up
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.