
# Postwave Project: Local Development & AWS Deployment Guide

---

## 🚀 Local Development

### 1. Run the Backend (FastAPI)

1. **Navigate to backend directory:**
	```bash
	cd backend
	```
2. **Create and activate a virtual environment:**
	```bash
	python -m venv .venv
	source .venv/bin/activate
	```
	Or use [uv](https://github.com/astral-sh/uv):
	```bash
	uv venv
	source .venv/bin/activate
	```
3. **Install dependencies:**
	```bash
	pip install -r requirements.txt
	# or
	uv sync
	```
4. **Configure environment variables:**
	- Copy `example.env` to `.env` and fill in your secrets.
	- Example:
	  ```bash
	  cp example.env .env
	  # Edit .env with your keys
	  ```
5. **Start the backend server:**
	```bash
	uvicorn app.main:app --reload --port 8000
	# or
	uv run uvicorn app.main:app --reload --port 8000
	```
	The API will be available at [http://localhost:8000](http://localhost:8000)

---

### 2. Run the Frontend (Next.js)

1. **Navigate to frontend directory:**
	```bash
	cd frontend
	```
2. **Install dependencies:**
	```bash
	npm install
	```
3. **Configure environment variables:**
	- Copy `example.env` to `.env` and fill in your keys.
	- Example:
	  ```bash
	  cp example.env .env
	  # Edit .env with your keys
	  ```
	- Ensure `NEXT_PUBLIC_API_URL` points to your backend (e.g., `http://localhost:8000`)
4. **Start the frontend server:**
	```bash
	npm run dev
	```
	The app will be available at [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploying to AWS (Terraform + ECS + S3)

### Prerequisites
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configured
- [Terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
- Docker installed & authenticated with AWS ECR

### 1. Provision Infrastructure
Go to the backend or infra directory (where your Terraform files are):
```bash
cd backend/terraform
terraform init
terraform apply
```
This creates VPC, RDS, ECR, ECS, and other resources. The ECS service will fail to start until the Docker image is pushed (expected).

### 2. Build & Push Backend Docker Image
Authenticate Docker to ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-ecr-url>
```
Build and push:
```bash
docker build --platform linux/amd64 -t postwave-backend ../..
docker tag postwave-backend:latest <your-ecr-url>/postwave-backend:latest
docker push <your-ecr-url>/postwave-backend:latest
```

### 3. Restart ECS Service
Force ECS to pull the new image:
```bash
aws ecs update-service --cluster <your-cluster> --service <your-service> --force-new-deployment
```

### 4. Deploy the Frontend (Static Hosting)
After backend is live (check ALB URL from Terraform outputs):
1. Set `NEXT_PUBLIC_API_URL` in your frontend `.env.production` to the backend ALB DNS name.
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

## 🛠 Troubleshooting & Tips
- **DB Migrations:** Run Alembic/SQLAlchemy migrations after first deploy (via ECS task or local connection).
- **Health Checks:** Ensure `/health` route returns 200 OK. Check CloudWatch logs if ECS restarts.
- **X API Errors:** Regenerate Access Tokens if you change X App permissions.
- **ECR Images:** If you destroy infra, ECR images are deleted (unless ECR is in a separate Terraform file).

---

## 📄 References
- See `backend/readMe.md` for advanced AWS deployment and troubleshooting.
- See `frontend/README.md` for Next.js usage details.



