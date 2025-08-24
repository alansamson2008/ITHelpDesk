from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class TicketStatus(str, Enum):
    RECEIVED = "received"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"

class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TicketCategory(str, Enum):
    HARDWARE = "hardware"
    SOFTWARE = "software"
    NETWORK = "network"
    EMAIL = "email"
    PRINTER = "printer"
    PHONE = "phone"
    OTHER = "other"

# Models
class ITSpecialist(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    active: bool = True

class Ticket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ticket_number: str
    title: str
    description: str
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus = TicketStatus.RECEIVED
    requester_name: str
    requester_email: str
    requester_phone: Optional[str] = None
    assigned_to: Optional[str] = None  # IT Specialist ID
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved_at: Optional[datetime] = None

class TicketCreate(BaseModel):
    title: str
    description: str
    category: TicketCategory
    priority: TicketPriority
    requester_name: str
    requester_email: str
    requester_phone: Optional[str] = None

class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    assigned_to: Optional[str] = None
    priority: Optional[TicketPriority] = None

class DashboardStats(BaseModel):
    total_tickets_today: int
    total_tickets_week: int
    total_tickets_month: int
    tickets_by_status: dict
    tickets_by_specialist: dict
    tickets_in_queue: int

# Initialize IT Specialists
async def initialize_specialists():
    specialists = [
        {"name": "Will Brown", "role": "IT Specialist"},
        {"name": "Trey Lake", "role": "IT Specialist"},
        {"name": "Frank Pizza", "role": "IT Specialist"},
        {"name": "Chaunice Devine", "role": "IT Specialist"},
        {"name": "Sr. IT Manager", "role": "Sr. IT Manager"}
    ]
    
    for specialist_data in specialists:
        existing = await db.specialists.find_one({"name": specialist_data["name"]})
        if not existing:
            specialist = ITSpecialist(**specialist_data)
            await db.specialists.insert_one(specialist.dict())

# Helper function to generate ticket number
async def generate_ticket_number():
    # Get current date for prefix
    date_prefix = datetime.now().strftime("%Y%m%d")
    
    # Find the highest ticket number for today
    today_tickets = await db.tickets.find(
        {"ticket_number": {"$regex": f"^{date_prefix}"}}
    ).sort("ticket_number", -1).limit(1).to_list(1)
    
    if today_tickets:
        last_number = int(today_tickets[0]["ticket_number"][-4:])
        new_number = last_number + 1
    else:
        new_number = 1
    
    return f"{date_prefix}{new_number:04d}"

# Routes
@api_router.get("/")
async def root():
    return {"message": "IT Ticketing System API"}

@api_router.get("/specialists", response_model=List[ITSpecialist])
async def get_specialists():
    specialists = await db.specialists.find({"active": True}).to_list(100)
    return [ITSpecialist(**specialist) for specialist in specialists]

@api_router.post("/tickets", response_model=Ticket)
async def create_ticket(ticket_data: TicketCreate):
    ticket_dict = ticket_data.dict()
    ticket_dict["ticket_number"] = await generate_ticket_number()
    
    ticket = Ticket(**ticket_dict)
    await db.tickets.insert_one(ticket.dict())
    return ticket

@api_router.get("/tickets", response_model=List[Ticket])
async def get_tickets(
    status: Optional[TicketStatus] = None,
    assigned_to: Optional[str] = None,
    limit: int = 100
):
    filter_dict = {}
    if status:
        filter_dict["status"] = status
    if assigned_to:
        filter_dict["assigned_to"] = assigned_to
        
    tickets = await db.tickets.find(filter_dict).sort("created_at", -1).limit(limit).to_list(limit)
    return [Ticket(**ticket) for ticket in tickets]

@api_router.get("/tickets/{ticket_number}", response_model=Ticket)
async def get_ticket_by_number(ticket_number: str):
    ticket = await db.tickets.find_one({"ticket_number": ticket_number})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return Ticket(**ticket)

@api_router.put("/tickets/{ticket_id}", response_model=Ticket)
async def update_ticket(ticket_id: str, update_data: TicketUpdate):
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    if update_data.status == TicketStatus.RESOLVED:
        update_dict["resolved_at"] = datetime.now(timezone.utc)
    
    result = await db.tickets.update_one(
        {"id": ticket_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket = await db.tickets.find_one({"id": ticket_id})
    return Ticket(**ticket)

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    from datetime import timedelta
    
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)
    
    # Count tickets
    total_today = await db.tickets.count_documents({
        "created_at": {"$gte": today_start}
    })
    
    total_week = await db.tickets.count_documents({
        "created_at": {"$gte": week_start}
    })
    
    total_month = await db.tickets.count_documents({
        "created_at": {"$gte": month_start}
    })
    
    # Tickets by status
    status_pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_results = await db.tickets.aggregate(status_pipeline).to_list(10)
    tickets_by_status = {item["_id"]: item["count"] for item in status_results}
    
    # Tickets by specialist
    specialist_pipeline = [
        {"$match": {"assigned_to": {"$ne": None}}},
        {"$lookup": {
            "from": "specialists",
            "localField": "assigned_to",
            "foreignField": "id",
            "as": "specialist"
        }},
        {"$unwind": "$specialist"},
        {"$group": {"_id": "$specialist.name", "count": {"$sum": 1}}}
    ]
    specialist_results = await db.tickets.aggregate(specialist_pipeline).to_list(10)
    tickets_by_specialist = {item["_id"]: item["count"] for item in specialist_results}
    
    # Tickets in queue (received status)
    tickets_in_queue = await db.tickets.count_documents({
        "status": TicketStatus.RECEIVED
    })
    
    return DashboardStats(
        total_tickets_today=total_today,
        total_tickets_week=total_week,
        total_tickets_month=total_month,
        tickets_by_status=tickets_by_status,
        tickets_by_specialist=tickets_by_specialist,
        tickets_in_queue=tickets_in_queue
    )

# Initialize data on startup
@app.on_event("startup")
async def startup_event():
    await initialize_specialists()

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()