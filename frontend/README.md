This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Yes, you will need to build and push the Docker image **after** your first partial apply, but **before** your final apply. 

This is because of a "chicken and egg" problem: Terraform needs the **ECR Repository** to exist before you can push an image to it, but the **ECS Service** will fail to start if it tries to pull an image that hasn't been pushed yet.

---

### The 4-Step "Successful Deploy" Sequence

To avoid errors, follow this exact order:

#### 1. First Apply (Infrastructure Setup)
Run Terraform but target **only** the repository first. This creates the "box" on AWS to hold your code.
```bash
terraform apply -target=aws_ecr_repository.app
```

#### 2. Docker Build & Push
Now that the repository exists, use the **Push Commands** (found in the AWS ECR Console) to upload your Next.js app.
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 383595113100.dkr.ecr.us-east-1.amazonaws.com

# Build and Tag
docker build -t postwave-frontend .
docker tag postwave-frontend:latest 383595113100.dkr.ecr.us-east-1.amazonaws.com/postwave-frontend:latest

# Push
docker push 383595113100.dkr.ecr.us-east-1.amazonaws.com/postwave-frontend:latest
```

#### 3. Second Apply (The Rest)
Now that the image is actually sitting in ECR, run a full apply. This will create the ECS Cluster, Service, and Load Balancer. They will now be able to find and pull your image successfully.
```bash
terraform apply
```

#### 4. Future Updates
Whenever you change your code (e.g., updating your Next.js components):
1. **Re-build and Re-push** the Docker image with the same `latest` tag.
2. **Force a New Deployment** in ECS so it pulls the new version:
   ```bash
   aws ecs update-service --cluster postwave-cluster --service postwave-service --force-new-deployment
   ```

---

### Summary Table: Build vs. Apply

| Action | When to do it? | Why? |
| :--- | :--- | :--- |
| **`terraform apply` (ECR only)** | **First** | Creates the URL where your image will live. |
| **`docker build & push`** | **Second** | Puts your code into the cloud so ECS can find it. |
| **`terraform apply` (Full)** | **Third** | Deploys the server and links it to your image. |

If you try to do a full `terraform apply` before pushing the image, your ECS service will get stuck in a "Task failed to start" loop because it's looking for an image that doesn't exist yet.



atfter applying terraform
This error means your ECS service is trying to pull the Docker image from ECR, but the image with the tag `latest` does not exist in your ECR repository.

**How to fix:**
1. Make sure you have built your Docker image:
   ```
   docker build -t postwave-frontend .
   ```
2. Tag the image for your ECR repository:
   ```
   docker tag postwave-frontend:latest 383595113100.dkr.ecr.us-east-1.amazonaws.com/postwave-frontend:latest
   ```
3. Log in to ECR:
   ```
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 383595113100.dkr.ecr.us-east-1.amazonaws.com
   ```
4. Push the image to ECR:
   ```
   docker push 383595113100.dkr.ecr.us-east-1.amazonaws.com/postwave-frontend:latest
   ```
5. After pushing, force a new ECS deployment:
   ```
   aws ecs update-service --cluster postwave-cluster --service postwave-service --force-new-deployment
   ```

**Summary:**  
ECS cannot find the image because it hasn't been pushed to ECR. Push the image as shown above, then ECS will be able to start your service.

Let me know if you need help with any of these steps!