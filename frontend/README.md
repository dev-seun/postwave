
# Postwave Frontend (Next.js)

This is the frontend for the Postwave project, built with [Next.js](https://nextjs.org). It is designed to work with the FastAPI backend and supports both local development and AWS deployment (ECS/S3/CloudFront).

---

## 🚀 Local Development

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `example.env` to `.env` and fill in your keys.
   - Ensure `NEXT_PUBLIC_API_URL` points to your backend (e.g., `http://localhost:8000`).
4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deploying to AWS (ECS + S3 + CloudFront)

### Prerequisites
- AWS CLI configured
- Docker installed & authenticated with AWS ECR
- Terraform infrastructure already applied (see project root README)

### 1. Build & Push Docker Image
1. **Login to ECR:**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-ecr-url>
   ```
2. **Build and tag the image:**
   ```bash
   docker build --platform linux/amd64 -t postwave-frontend .
   docker tag postwave-frontend:latest <your-ecr-url>/postwave-frontend:latest
   ```
3. **Push to ECR:**
   ```bash
   docker push <your-ecr-url>/postwave-frontend:latest
   ```

### 2. Deploy/Update ECS Service
After pushing, force ECS to pull the new image:
```bash
aws ecs update-service --cluster <your-cluster> --service <your-service> --force-new-deployment
```

### 3. (Optional) Static Export to S3/CloudFront
If using static hosting:
1. Set `NEXT_PUBLIC_API_URL` in `.env.production` to your backend ALB DNS name.
2. Build the frontend:
   ```bash
   npm run build
   ```
3. Sync static files to S3:
   ```bash
   aws s3 sync out/ s3://<your-s3-bucket> --delete
   ```
4. Invalidate CloudFront cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id <YOUR_CF_ID> --paths "/*"
   ```

---

## 🛠 Troubleshooting

- **ECS can't find image:**
   - Make sure you have built, tagged, and pushed the Docker image to ECR.
   - Force a new ECS deployment after pushing.
- **Environment variables:**
   - Ensure `.env` and `.env.production` are set correctly for your environment.
- **See project root `readme.md` for full-stack deployment and troubleshooting.**

---

## 📄 References
- [Next.js Documentation](https://nextjs.org/docs)
- [Project root README](../readme.md)