# Quick Reference Guide - Project Tracker

## 🚀 Quick Start Commands

### First Time Setup
```bash
# Install all dependencies
install.bat

# Configure AWS credentials
# Edit backend\.env with your AWS credentials
```

### Start Development
```bash
# Start both servers (easiest method)
start-dev.bat

# OR manually in separate terminals:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📋 Common Tasks

### Upload a File
1. Open http://localhost:5173
2. Click "Upload" tab
3. Drag & drop CSV/Excel file or click to browse
4. Wait for upload and analysis to complete
5. View results in "Dashboard" tab

### Trigger Manual Analysis
1. Click "Refresh Analysis" button in header
2. Wait for processing
3. Dashboard will update automatically

### View Stories
1. Click "All Stories" tab
2. Use filters to narrow down results
3. Use sort options to organize
4. Stories are grouped by project

## 🔧 Configuration

### AWS Credentials
File: `backend\.env`
```env
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

### Change Analysis Schedule
File: `backend\server.js`
Line 30: `cron.schedule('0 6 * * *', ...)`

Common patterns:
- `'0 * * * *'` - Every hour
- `'*/30 * * * *'` - Every 30 minutes
- `'0 6,18 * * *'` - 6 AM and 6 PM daily
- `'0 0 * * 0'` - Weekly on Sunday midnight

### Modify Working Hours
File: `backend\jobs\storyAnalyzer.js`
Line 54: `const workingHoursPerDay = 8;`

## 📊 API Endpoints Reference

### Stories
```
GET    /api/stories              - Get all stories
GET    /api/stories/analysis     - Get latest analysis
POST   /api/stories/analyze      - Trigger manual analysis
GET    /api/stories/by-project   - Stories grouped by project
GET    /api/stories/by-epic      - Stories grouped by epic
GET    /api/stories/:id          - Get single story by ID
```

### Upload
```
POST   /api/upload               - Upload and process file
POST   /api/upload/validate      - Validate file without uploading
```

### Health
```
GET    /health                   - Server health check
```

## 📁 CSV File Format

### Required Columns
```csv
id,description,epicDescription,projectDescription,dueDate,duration,timeSpent,status,priority
```

### Example Row
```csv
STORY-001,Implement login,User Auth,Project Alpha,2025-12-31,40,25,In progress,high
```

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

### Date Format
- YYYY-MM-DD (e.g., 2025-12-31)
- Excel date numbers are also supported

## 🐳 Docker Commands

### Start with Docker
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend
```

### Stop Containers
```bash
docker-compose down
```

### Rebuild After Changes
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### Clean Everything
```bash
docker-compose down -v
docker system prune -a
```

## 🔍 Troubleshooting

### Backend Won't Start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Check environment variables
cd backend
type .env

# Check logs
npm run dev
```

### Frontend Won't Start
```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Clear cache and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Can't Connect to Backend
1. Verify backend is running: http://localhost:3001/health
2. Check CORS settings in `backend\server.js`
3. Verify `FRONTEND_URL` in `backend\.env`

### File Upload Fails
1. Check file format (CSV or Excel only)
2. Verify file size (max 10MB)
3. Check AWS credentials in `.env`
4. Verify S3 bucket exists and is accessible
5. Check backend logs for errors

### Analysis Not Running
1. Check if file exists in S3
2. Verify cron schedule in `backend\server.js`
3. Check backend logs for errors
4. Try manual analysis via "Refresh Analysis" button

## 📈 Understanding the Analysis

### Urgency Score
Higher score = more urgent

Formula:
```
(Priority Weight × Status Weight × Remaining Hours) / Days Until Due
```

Weights:
- High Priority: 3
- Medium Priority: 2
- Low Priority: 1

### Risk Categories

**Overdue**: Due date has passed
**At Risk**: Not enough time to complete based on remaining hours
**Need to Start**: High urgency but not yet started
**In Progress**: Currently being worked on

## 🎨 Customization

### Change Theme Colors
File: `src\index.css`
Lines 4-8: Color palette variables

### Modify Card Styles
File: `src\index.css`
Lines 150-170: Card component styles

### Update Logo/Title
File: `src\App.jsx`
Line 95: App title

### Change Font
File: `src\index.css`
Line 1: Google Fonts import
Line 34: Font family

## 📦 Project Structure Quick Reference

```
project-tracker/
├── backend/              # Node.js backend
│   ├── jobs/            # Scheduled jobs
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── server.js        # Main server file
├── src/                 # React frontend
│   ├── components/      # React components
│   ├── App.jsx         # Main app
│   └── index.css       # Styles
├── sample-stories.csv   # Test data
├── docker-compose.yml   # Docker config
└── README.md           # Full documentation
```

## 🔐 Security Checklist

- [ ] AWS credentials configured in `.env`
- [ ] `.env` file in `.gitignore`
- [ ] S3 bucket has proper IAM permissions
- [ ] CORS configured for your domain
- [ ] File upload size limits set
- [ ] File type validation enabled

## 📝 Daily Workflow

1. **Morning**: Check dashboard for overdue/at-risk stories
2. **During Day**: Update CSV file with progress
3. **End of Day**: Upload updated CSV file
4. **Next Morning**: Automated analysis runs at 6 AM
5. **Review**: Check dashboard for new recommendations

## 🚀 Deployment Checklist

- [ ] AWS S3 bucket created
- [ ] IAM user with S3 permissions created
- [ ] Credentials added to `.env`
- [ ] Docker installed on server
- [ ] Ports 80 and 3001 open in firewall
- [ ] Domain configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Monitoring set up (optional)

## 📞 Getting Help

1. Check `README.md` for detailed documentation
2. Check `DEPLOYMENT.md` for deployment guide
3. Check `PROJECT_SUMMARY.md` for implementation details
4. Review backend logs for errors
5. Check browser console for frontend errors

## 🎯 Performance Tips

1. Keep CSV files under 5MB for best performance
2. Archive old analysis results monthly
3. Use filters in "All Stories" for large datasets
4. Run manual analysis during off-peak hours
5. Monitor Docker container resources

## 💾 Backup Strategy

1. S3 versioning enabled (recommended)
2. Export analysis results weekly
3. Backup `.env` file securely
4. Keep CSV files in version control
5. Regular Docker image backups

---

**Quick Help**: For immediate assistance, check the logs:
- Backend: `backend\` directory, run `npm run dev`
- Frontend: Browser console (F12)
- Docker: `docker-compose logs -f`
