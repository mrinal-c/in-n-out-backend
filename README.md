# in-n-out-backend

# Docker Steps
 1. Local Build
 - docker build -t in-n-out-backend:latest .
 2. Local Run
 - docker run --env-file .env -p 5000:5000 in-n-out-backend:latest
 3. Publish to Docker Hub

 # GCP Steps
 1. Use UI to deploy and add ENV vars in UI