# Project Tracker

A comprehensive web application for tracking and analyzing project stories with intelligent prioritization and risk assessment.

## 🚀 Features

### Core Functionality
- **Story Management**: Track stories with detailed attributes (ID, description, epic, project, due date, duration, time spent, status, priority)
- **Intelligent Analysis**: Automated daily analysis to identify:
  - Overdue stories
  - Stories at risk of missing deadlines
  - High-priority stories that need to start soon
  - Stories currently in progress
- **File Upload**: Support for CSV and Excel files with automatic parsing and validation
- **S3 Integration**: Automatic upload to AWS S3 for data persistence
- **Scheduled Jobs**: Daily automated analysis at 6:00 AM

### Analysis Algorithm
The system uses a sophisticated urgency scoring algorithm that considers:
- **Priority**: High, medium, or low priority weighting
- **Status**: Current story status (To Do, In Progress, etc.)
- **Time Remaining**: Days until due date
- **Effort Remaining**: Hours needed to complete
- **Risk Assessment**: Identifies stories where remaining effort exceeds available time

### UI Features
- Modern, responsive dark theme with vibrant gradients
- Real-time dashboard with key metrics
- Filterable and sortable story views
- Progress tracking with visual indicators
- Drag-and-drop file upload
- Smooth animations and transitions

## 🛠️ Technology Stack

### Frontend
- **React** (Vite)
- **Modern CSS** with custom design system
- **Responsive Design**

### Backend
- **Node.js** with Express
- **AWS SDK** for S3 integration
- **node-cron** for scheduled jobs
- **CSV/Excel parsing** with csv-parser and xlsx

### Deployment
- **Docker** containerization
- **Docker Compose** for orchestration
- **Nginx** for frontend serving
- **AWS S3** for file storage

## 📋 Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- AWS Account with S3 access
- AWS credentials (Access Key ID and Secret Access Key)

## 🚀 Getting Started

### 1. Clone and Setup

```bash
cd project-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your AWS credentials
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=your-bucket-name
```

### 3. Frontend Setup

```bash
cd ..
npm install
```

### 4. Run Locally (Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Access the application at `http://localhost:5173`

### 5. Run with Docker

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

Access the application at `http://localhost`

## 📁 File Format

### CSV/Excel Structure

Your stories file should include the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| id | Unique story identifier | STORY-001 |
| description | Story description | Implement user authentication |
| epicDescription | Epic name | User Management |
| projectDescription | Project name | Project Alpha |
| dueDate | Due date (YYYY-MM-DD) | 2025-12-31 |
| duration | Estimated hours | 40 |
| timeSpent | Hours spent | 25 |
| status | Current status | In progress |
| priority | Priority level | high |

### Valid Status Values
- To Do
- Won't do
- In progress
- In test
- In deploy
- Closed
- Rejected
- Reopen

### Valid Priority Values
- high
- medium
- low

### Sample File

A sample CSV file (`sample-stories.csv`) is included in the project root for testing.

## 🔄 Daily Workflow

1. **Update Stories File**: Update your CSV/Excel file with latest story data
2. **Upload to S3**: Upload the file to your S3 bucket (or use the web interface)
3. **Automated Analysis**: The system runs analysis daily at 6:00 AM
4. **Review Dashboard**: Check the dashboard for insights and recommendations

## 📊 API Endpoints

### Stories
- `GET /api/stories` - Get all stories
- `GET /api/stories/analysis` - Get latest analysis
- `POST /api/stories/analyze` - Trigger manual analysis
- `GET /api/stories/by-project` - Get stories grouped by project
- `GET /api/stories/by-epic` - Get stories grouped by epic
- `GET /api/stories/:id` - Get single story

### Upload
- `POST /api/upload` - Upload and process file
- `POST /api/upload/validate` - Validate file without uploading

## 🏗️ Project Structure

```
project-tracker/
├── backend/
│   ├── jobs/
│   │   └── storyAnalyzer.js      # Analysis logic
│   ├── routes/
│   │   ├── stories.js             # Story endpoints
│   │   └── upload.js              # Upload endpoints
│   ├── services/
│   │   ├── s3Service.js           # AWS S3 operations
│   │   └── csvParser.js           # File parsing
│   ├── server.js                  # Express server
│   ├── package.json
│   └── Dockerfile
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── AllStories.jsx         # Story list view
│   │   ├── StoryCard.jsx          # Story card component
│   │   └── FileUpload.jsx         # Upload component
│   ├── App.jsx                    # Main app component
│   └── index.css                  # Design system
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
└── sample-stories.csv
```

## 🎨 Design System

The application features a modern design system with:
- Dark theme with vibrant gradients
- Custom color palette
- Smooth animations and transitions
- Responsive layouts
- Glassmorphism effects
- Custom scrollbars

## 🔐 AWS S3 Setup

1. Create an S3 bucket in your AWS account
2. Configure bucket permissions for read/write access
3. Create IAM user with S3 access
4. Generate access keys
5. Add credentials to `.env` file

### Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

## 📈 Analysis Logic

### Urgency Score Calculation

```
urgencyScore = (priorityWeight × statusWeight × remainingHours) / daysUntilDue

Where:
- priorityWeight: high=3, medium=2, low=1
- statusWeight: varies by status (To Do=1, In Progress=0.5, etc.)
- remainingHours: duration - timeSpent
- daysUntilDue: days until due date
```

### Risk Assessment

A story is considered "at risk" when:
```
daysNeeded >= daysUntilDue

Where:
- daysNeeded = remainingHours / 8 (assuming 8-hour workdays)
- daysUntilDue = days until due date
```

## 🚀 Deployment to AWS

### Using Docker on EC2

1. Launch EC2 instance (Amazon Linux 2 or Ubuntu)
2. Install Docker and Docker Compose
3. Clone repository
4. Configure environment variables
5. Run `docker-compose up -d`
6. Configure security groups (ports 80, 3001)

### Using ECS (Elastic Container Service)

1. Push Docker images to ECR
2. Create ECS cluster
3. Define task definitions
4. Create services
5. Configure load balancer
6. Set up CloudWatch for monitoring

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=project-tracker-data
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
```

### Cron Schedule

The analysis job runs daily at 6:00 AM. To change the schedule, edit `backend/server.js`:

```javascript
// Current: 6 AM daily
cron.schedule('0 6 * * *', async () => { ... });

// Examples:
// Every hour: '0 * * * *'
// Every 30 minutes: '*/30 * * * *'
// Twice daily (6 AM and 6 PM): '0 6,18 * * *'
```

## 🐛 Troubleshooting

### Backend won't start
- Check AWS credentials in `.env`
- Verify S3 bucket exists and is accessible
- Check port 3001 is not in use

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check CORS settings in `backend/server.js`
- Verify API_BASE_URL in `src/App.jsx`

### File upload fails
- Check file format (CSV or Excel)
- Verify required columns are present
- Check S3 bucket permissions
- Review file size (max 10MB)

### Analysis not running
- Check cron schedule in `backend/server.js`
- Verify at least one file exists in S3
- Check backend logs for errors

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, Node.js, and AWS
