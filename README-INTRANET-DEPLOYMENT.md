# IT Ticketing System - Intranet Deployment Guide

## Overview
This IT Ticketing System is designed for internal deployment at Renewal by Andersen. It provides a comprehensive dashboard for tracking IT support tickets with integration to Monday.com forms.

## Features
- Real-time dashboard with ticket statistics
- IT specialist workload distribution
- Ticket status tracking by ticket number
- Integration with existing Monday.com forms
- Clean, professional interface with company branding

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Access to MongoDB instance (local or cloud)
- Internal network configuration

### 1. Clone and Setup
```bash
git clone [your-repository-url]
cd it-ticketing-system
```

### 2. Environment Configuration
```bash
# Copy environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Edit configuration files for your environment
nano frontend/.env
nano backend/.env
```

### 3. Update Configuration
Edit the following files for your intranet:

**frontend/.env:**
```
REACT_APP_BACKEND_URL=http://your-internal-server.com:8001
REACT_APP_MONDAY_FORM_URL=https://forms.monday.com/forms/a4a0b62dd139cdd5e5976c5f02ff6879?r=use1
```

**backend/.env:**
```
MONGO_URL="mongodb://your-internal-mongodb:27017"
DB_NAME="it_ticketing_system"
CORS_ORIGINS="http://your-internal-server.com"
```

**docker-compose.yml:**
Update the environment variables and ports as needed for your infrastructure.

**nginx/nginx.conf:**
Replace `your-internal-server.com` with your actual internal domain.

### 4. Deploy with Docker
```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Access the Application
- Dashboard: http://your-internal-server.com
- Ticket Status: http://your-internal-server.com/status
- API: http://your-internal-server.com:8001/api

## Manual Deployment (Without Docker)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend Setup
```bash
cd frontend
npm install
npm run build
# Serve build folder with your web server
```

### Database Setup
```bash
# Install and start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Configuration Details

### IT Specialists
The system is pre-configured with your team:
- Will Brown (IT Specialist)
- Trey Lake (IT Specialist)  
- Frank Pizza (IT Specialist)
- Chaunice Devine (IT Specialist)
- Alan Samson (Sr. IT Manager)

### Monday.com Integration
- Submit button opens your existing Monday.com form
- Form URL is configurable in environment variables
- Future API integration planned for pulling ticket data

### Security Considerations
- Configure firewall rules for internal access only
- Use HTTPS with internal SSL certificates
- Consider LDAP integration for user authentication
- Regular security updates and monitoring

## Customization

### Branding
- Company logo is already integrated
- Colors use Renewal by Andersen green theme
- Footer shows "Made by ISC IT Department"

### Adding Features
- The codebase is fully modular
- Add new components in respective directories
- API endpoints can be extended in server.py
- Database models are defined with Pydantic

## Monitoring and Maintenance

### Health Checks
- Frontend: http://your-internal-server.com/health
- Backend: http://your-internal-server.com:8001/api/
- Database: Check MongoDB connection

### Backup Strategy
```bash
# MongoDB backup
mongodump --db it_ticketing_system --out /backup/$(date +%Y%m%d)

# Application backup
tar -czf app-backup-$(date +%Y%m%d).tar.gz /path/to/application
```

### Log Management
- Application logs: `docker-compose logs`
- Nginx logs: `/var/log/nginx/`
- MongoDB logs: `/var/log/mongodb/`

## Troubleshooting

### Common Issues
1. **Database Connection**: Check MongoDB URL and network connectivity
2. **CORS Errors**: Verify CORS_ORIGINS includes your domain
3. **Port Conflicts**: Ensure ports 80, 3000, 8001, 27017 are available
4. **Permission Issues**: Check file permissions and user contexts

### Support
- Check application logs for detailed error messages
- Verify environment variables are correctly set
- Ensure all services are running and accessible

## Future Enhancements
- Monday.com API integration for real-time data sync
- LDAP authentication integration
- Advanced reporting and analytics
- Mobile-responsive improvements
- Email notifications for ticket updates

## License
This application code belongs to Renewal by Andersen and can be freely modified and deployed on internal infrastructure without any restrictions.