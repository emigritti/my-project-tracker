# Deployment Guide - Project Tracker

This guide covers deploying the Project Tracker application to AWS using Docker.

## Prerequisites

- AWS Account
- Docker installed locally
- AWS CLI configured
- Domain name (optional, for production)

## Option 1: Deploy to AWS EC2 with Docker

### Step 1: Launch EC2 Instance

1. Go to AWS EC2 Console
2. Click "Launch Instance"
3. Choose Amazon Linux 2 or Ubuntu 20.04 LTS
4. Instance type: t2.medium or larger
5. Configure Security Group:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS - optional)
   - Port 3001 (Backend API)
6. Create or select a key pair
7. Launch instance

### Step 2: Connect to EC2 Instance

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

### Step 3: Install Docker and Docker Compose

**For Amazon Linux 2:**
```bash
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**For Ubuntu:**
```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```

Log out and log back in for group changes to take effect.

### Step 4: Clone Repository

```bash
git clone <your-repository-url>
cd project-tracker
```

### Step 5: Configure Environment

```bash
cd backend
cp .env.example .env
nano .env
```

Update with your AWS credentials:
```env
AWS_ACCESS_KEY_ID=your_actual_access_key
AWS_SECRET_ACCESS_KEY=your_actual_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://your-domain-or-ip
```

### Step 6: Build and Run with Docker Compose

```bash
cd ..
docker-compose up -d
```

### Step 7: Verify Deployment

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Test backend
curl http://localhost:3001/health

# Test frontend
curl http://localhost:80
```

### Step 8: Access Application

Open browser and navigate to:
```
http://your-ec2-public-ip
```

## Option 2: Deploy to AWS ECS (Elastic Container Service)

### Step 1: Create ECR Repositories

```bash
# Create repository for backend
aws ecr create-repository --repository-name project-tracker-backend

# Create repository for frontend
aws ecr create-repository --repository-name project-tracker-frontend
```

### Step 2: Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t project-tracker-backend .
docker tag project-tracker-backend:latest <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/project-tracker-backend:latest
docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/project-tracker-backend:latest

# Build and push frontend
cd ..
docker build -t project-tracker-frontend .
docker tag project-tracker-frontend:latest <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/project-tracker-frontend:latest
docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/project-tracker-frontend:latest
```

### Step 3: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name project-tracker-cluster
```

### Step 4: Create Task Definitions

Create `task-definition.json`:

```json
{
  "family": "project-tracker",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<your-account-id>.dkr.ecr.us-east-1.amazonaws.com/project-tracker-backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3001"
        }
      ],
      "secrets": [
        {
          "name": "AWS_ACCESS_KEY_ID",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:project-tracker/aws-credentials:AWS_ACCESS_KEY_ID"
        },
        {
          "name": "AWS_SECRET_ACCESS_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:project-tracker/aws-credentials:AWS_SECRET_ACCESS_KEY"
        }
      ]
    },
    {
      "name": "frontend",
      "image": "<your-account-id>.dkr.ecr.us-east-1.amazonaws.com/project-tracker-frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ]
    }
  ]
}
```

Register task definition:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### Step 5: Create ECS Service

```bash
aws ecs create-service \
  --cluster project-tracker-cluster \
  --service-name project-tracker-service \
  --task-definition project-tracker \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}"
```

## AWS S3 Bucket Setup

### Create S3 Bucket

```bash
aws s3 mb s3://project-tracker-data --region us-east-1
```

### Configure Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowBackendAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::account-id:user/project-tracker-user"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::project-tracker-data/*",
        "arn:aws:s3:::project-tracker-data"
      ]
    }
  ]
}
```

### Enable Versioning (Optional but Recommended)

```bash
aws s3api put-bucket-versioning \
  --bucket project-tracker-data \
  --versioning-configuration Status=Enabled
```

## SSL/TLS Setup (Optional)

### Using AWS Certificate Manager

1. Request certificate in ACM
2. Validate domain ownership
3. Configure Application Load Balancer
4. Update security groups
5. Update frontend URL in backend .env

### Using Let's Encrypt

```bash
# Install certbot
sudo yum install certbot -y  # Amazon Linux
sudo apt install certbot -y  # Ubuntu

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Configure nginx with SSL
# Update nginx.conf with SSL settings
```

## Monitoring and Logging

### CloudWatch Logs

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/project-tracker

# View logs
aws logs tail /ecs/project-tracker --follow
```

### CloudWatch Alarms

```bash
# Create alarm for high CPU
aws cloudwatch put-metric-alarm \
  --alarm-name project-tracker-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## Backup Strategy

### Automated S3 Backups

Create a Lambda function to backup analysis results:

```javascript
// backup-lambda.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const date = new Date().toISOString().split('T')[0];
  
  // Copy analysis results to backup bucket
  await s3.copyObject({
    Bucket: 'project-tracker-backups',
    CopySource: `project-tracker-data/analysis-${date}.json`,
    Key: `backups/analysis-${date}.json`
  }).promise();
  
  return { statusCode: 200, body: 'Backup completed' };
};
```

Schedule with CloudWatch Events (EventBridge).

## Scaling Considerations

### Horizontal Scaling

Update ECS service desired count:
```bash
aws ecs update-service \
  --cluster project-tracker-cluster \
  --service project-tracker-service \
  --desired-count 3
```

### Auto Scaling

Create auto-scaling policy:
```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/project-tracker-cluster/project-tracker-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 5
```

## Cost Optimization

1. **Use Reserved Instances** for predictable workloads
2. **Enable S3 Lifecycle Policies** to archive old files
3. **Use CloudWatch Logs retention** to control log storage costs
4. **Right-size EC2 instances** based on actual usage
5. **Use Spot Instances** for non-critical workloads

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker ps -a

# Restart containers
docker-compose restart
```

### Can't connect to backend

```bash
# Check if backend is running
curl http://localhost:3001/health

# Check security group rules
# Ensure port 3001 is open

# Check environment variables
docker-compose exec backend env
```

### S3 access denied

```bash
# Verify IAM permissions
aws s3 ls s3://project-tracker-data

# Check bucket policy
aws s3api get-bucket-policy --bucket project-tracker-data

# Verify credentials in .env
```

## Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Cleanup

```bash
# Clean old analysis results (keep last 30 days)
find backend/analysis-results -name "analysis-*.json" -mtime +30 -delete
```

### Monitor Disk Space

```bash
# Check disk usage
df -h

# Clean Docker images
docker system prune -a
```

## Security Best Practices

1. **Use AWS Secrets Manager** for credentials
2. **Enable VPC** for ECS tasks
3. **Use Security Groups** to restrict access
4. **Enable CloudTrail** for audit logging
5. **Regular security updates** for base images
6. **Use IAM roles** instead of access keys when possible
7. **Enable S3 encryption** at rest
8. **Use HTTPS** for all communications

## Support

For deployment issues:
1. Check CloudWatch Logs
2. Review security group settings
3. Verify IAM permissions
4. Check Docker logs
5. Review application logs

---

Last updated: December 2025
