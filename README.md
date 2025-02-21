## Project Name: Full Stack Project (Next.js + Flask)

### Overview
This project consists of a Next.js frontend and a Flask backend. The services are containerized using Docker, and you can run them individually or together using Docker Compose.

### Prerequisites

Make sure you have the following installed on your machine:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Directory Structure
```bash
/project-root
  /frontend
    Dockerfile-frontend
    package.json
    # Other Next.js files
  /backend
    Dockerfile-backend
    requirements.txt
    main.py
    # Other Flask files
  docker-compose.yml
```

### Setting Up the Project

1. Clone this repository:

```bash
git clone https://github.com/karmraj-citrusbug/trial-test
cd trial-test
```

### Frontend (Next.js)

1. **Dockerfile-frontend**: The Next.js app runs on port `3000`.

   **To run the frontend independently:**
   ```bash
   cd frontend
   docker build -t frontend-app -f Dockerfile-frontend .
   docker run -p 3000:3000 frontend-app
   ```
   The frontend will be accessible at `http://localhost:3000`.

### Backend (Flask)

1. **Dockerfile-backend**: The Flask app runs on port `5000`. CORS is enabled for cross-origin requests from the frontend.

   **To run the backend independently:**
   ```bash
   cd backend
   docker build -t backend-app -f Dockerfile-backend .
   docker run -p 5000:5000 backend-app
   ```
   The backend will be accessible at `http://localhost:5000`.

### Recommended: Running Both Frontend and Backend Together

You can use Docker Compose to run both services together in a single command.

1. **Docker Compose**: The `docker-compose.yml` is located in the root directory. It orchestrates both the Next.js frontend and the Flask backend.

   **To run the entire project (frontend + backend):**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build and run the frontend on port `3000` (`http://localhost:3000`)
   - Build and run the backend on port `5000` (`http://localhost:5000`)

### CORS Configuration

- The Flask backend uses `flask-cors` to allow cross-origin requests from the frontend.
- The `CORS(app)` setting in `main.py` enables CORS for all domains.
- You can restrict the allowed origins to the frontend by modifying the `CORS` setup as follows:

```python
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
```

### Testing

- **Frontend**: Once the frontend is running, visit `http://localhost:3000` in your browser to test the UI.
- **Backend**: You can test the backend using tools like `curl` or Postman by sending requests to `http://localhost:5000`.

### Stopping the Services

To stop the Docker containers, use the following command:
```bash
docker-compose down
```

### Additional Commands

- To rebuild containers after making changes:
  ```bash
  docker-compose up --build
  ```

- To stop and remove all containers:
  ```bash
  docker-compose down
  ```

### Common Issues

1. **CORS Errors**: If you get CORS errors, make sure CORS is properly configured in the Flask backend as described above.
2. **Port Conflicts**: If you have other services running on ports `3000` or `5000`, stop them or change the exposed ports in `docker-compose.yml`.

### Conclusion

You now have a complete Next.js and Flask application running in Docker containers. Modify the Dockerfiles and `docker-compose.yml` as needed for your specific deployment and configuration needs.
