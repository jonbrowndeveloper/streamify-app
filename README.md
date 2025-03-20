# Streamify

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

## Requirements

- Node.js
- Docker

## Project Structure

```
streamify-app
├── .gitignore
├── docker-compose.yml
├── README.md
├── .vscode/
│   ├── launch.json
│   └── tasks.json
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── settings.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app.ts
│   │   ├── database.ts
│   │   ├── loadSettings.ts
│   │   ├── nms.ts
│   │   ├── server.ts
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
├── frontend/
│   ├── Dockerfile
│   ├── loadSettings.js
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── package.json
│   ├── settings.json
│   ├── tsconfig.json
│   ├── tsconfig.tsbuildinfo
│   ├── .next/
│   │   ├── BUILD_ID
│   │   ├── build-manifest.json
│   │   └── ...
│   ├── public/
│   │   └── assets/
│   └── src/
├── monitor/
│   ├── package.json
│   ├── logs/
│   └── src/
```

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd streamify-app
   ```

2. Set up the backend:
   - Navigate to the backend directory:
     ```sh
     cd backend
     ```
   - Install dependencies:
     ```sh
     npm install
     ```
   - Configure your PostgreSQL database in the environment variables.

3. Set up the frontend:
   - Navigate to the frontend directory:
     ```sh
     cd ../frontend
     ```
   - Install dependencies:
     ```sh
     npm install
     ```

4. Set up the monitor:
   - Navigate to the monitor directory:
     ```sh
     cd ../monitor
     ```
   - Install dependencies:
     ```sh
     npm install
     ```

### Running the Application

The preferred method to run the application is by using the monitor app. The monitor app can start, stop, and update the backend and frontend services.

- To start the services:
  ```sh
  cd monitor
  npm start
  ```
  Or with a 30 second cron job to run /update
  ```
  npm start:cron
  ```

- Then, in your browser, navigate to `http://localhost:4000/start` to start the backend and frontend services.

- To stop the services:
  In your browser, navigate to `http://localhost:4000/stop` to stop the backend and frontend services.

- To update the services:
  In your browser, navigate to `http://localhost:4000/update` to update the backend and frontend services.
  You can also hit `http://localhost:4000/update?force=true` to force the backend and frontend services to update and restart.

- To view logs:
  In your browser, navigate to `http://localhost:4000/logs?app=<backend OR frontend>` to view logs for the backend and frontend services.

### Docker Setup

To run the Postgress DB using Docker, you can use the provided `docker-compose.yml` file. Run the following command in the root directory of the project:

```sh
docker-compose up
```

## Setting up the Monitor Service with systemctl for Ubuntu Server

To manage the monitor service using `systemctl`, follow these steps:

1. Create a systemd service file:

    ```ini
    [Unit]
    Description=Streamify Monitor Application
    After=network.target

    [Service]
    WorkingDirectory=/home/jb/streamify-app/monitor
    ExecStart=/usr/bin/npm run start
    Restart=always
    User=jb
    Environment=PATH=/usr/bin:/usr/local/bin
    Environment=NODE_ENV=production
    ExecStartPre=/usr/bin/npm install

    [Install]
    WantedBy=multi-user.target
    ```

    Replace `/home/jb/streamify-app/monitor` with the actual path to your project if different.

2. Copy the service file to the systemd directory:

    ```sh
    sudo cp streamify-monitor.service /etc/systemd/system/
    ```

3. Reload the systemd daemon:

    ```sh
    sudo systemctl daemon-reload
    ```

4. Enable the service to start on boot:

    ```sh
    sudo systemctl enable streamify-monitor
    ```

5. Start the service:

    ```sh
    sudo systemctl start streamify-monitor
    ```

6. Check the status of the service:

    ```sh
    sudo systemctl status streamify-monitor
    ```
    
## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.