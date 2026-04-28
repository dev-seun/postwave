Since you are managing a full-stack environment with a persistent database and an "always-on" background worker, the order of operations is vital. If you run a `terraform destroy` and then want to go back up, follow these steps to ensure the database is ready before the app tries to connect.

Add this section to your **README.md**:

---

## 🚀 Re-Deployment After `terraform destroy`

Because the infrastructure includes a database (RDS) and container registry (ECR), follow this exact sequence to avoid "Circular Dependency" errors.

### 1. Provision the Infrastructure
Run Terraform to create the VPC, RDS Instance, and ECR Repository. 
> **Note:** The initial apply will create the ECS Service, but the Service will temporarily fail to start because the Docker image isn't in ECR yet. This is expected.

```bash
terraform apply
```

### 2. Authenticate Docker with AWS
Before you can push your build, you must authenticate your local Docker client to your ECR registry.
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 383595113100.dkr.ecr.us-east-1.amazonaws.com
```

### 3. Build & Push the Backend Image
Next.js API/FastAPI needs to be packaged and sent to the cloud.
```bash
# Build for Linux/AMD64 (Fargate standard)
docker build --platform linux/amd64 -t postwave-backend .

# Tag the image
docker tag postwave-backend:latest 383595113100.dkr.ecr.us-east-1.amazonaws.com/postwave-backend:latest

# Push to ECR
docker push 383595113100.dkr.ecr.us-east-1.amazonaws.com/postwave-backend:latest
```

### 4. Force ECS to Pull the New Image
Since Terraform already created the service in Step 1, tell ECS to restart the tasks so they can grab the image you just pushed.
```bash
aws ecs update-service --cluster postwave-dev-cluster --service postwave-dev-service --force-new-deployment
```
Since Terraform already created the service in Step 1, you need to tell ECS to restart the tasks so they pull the latest image you just pushed. Replace the cluster and service names with your actual values if different:
```bash
# Replace with your ECS cluster and service names if needed
aws ecs update-service \
    --cluster <your-ecs-cluster-name> \
    --service <your-ecs-service-name> \
    --force-new-deployment
```
For example:
```bash
aws ecs update-service --cluster postwave-dev-cluster --service postwave-dev-service --force-new-deployment
```

### 5. Deploy the Frontend (Next.js)
Once the backend is live (check the ALB URL provided in Terraform outputs), deploy the static frontend.

1.  **Update Environment:** Set `NEXT_PUBLIC_API_URL` in your `.env.production` to the ALB DNS name.
2.  **Build:** `npm run build`
3.  **Sync to S3:** ```bash
    aws s3 sync out/ s3://postwave-frontend-assets-dev --delete
    ```
4.  **Clear Cache:**
    ```bash
    aws cloudfront create-invalidation --distribution-id <YOUR_CF_ID> --paths "/*"
    ```

---

### 🛠 Troubleshooting Post-Deployment
* **Database Migrations:** If this is a fresh DB, remember to run your Alembic/SQLAlchemy migrations. You can do this by running a one-off task in ECS or connecting via your local machine (since `publicly_accessible = true` in your config).
* **Health Checks:** If the service keeps restarting, check the CloudWatch logs. Ensure your `/health` route is returning a **200 OK**.
* **X API Errors:** Ensure you have regenerated your **Access Tokens** if you changed your App Permissions in the X Developer Portal.

---

**Quick Reminder:** Since you have `force_delete = true` in your ECR config, a `destroy` wiped your images. If you find yourself destroying and re-creating often, consider moving the ECR resource to a separate "base" Terraform file so it stays alive even when the app is down!