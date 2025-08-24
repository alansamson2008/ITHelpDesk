import requests
import sys
import json
from datetime import datetime

class ITTicketingAPITester:
    def __init__(self, base_url="https://support-central-6.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ticket_id = None
        self.created_ticket_number = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                    elif isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    return success, response_data
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")

            return success, response.json() if response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_get_specialists(self):
        """Test getting IT specialists"""
        success, response = self.run_test(
            "Get IT Specialists",
            "GET",
            "specialists",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} specialists:")
            for specialist in response:
                print(f"     - {specialist.get('name', 'Unknown')} ({specialist.get('role', 'Unknown')})")
            
            # Verify we have the expected 5 specialists
            expected_names = ["Will Brown", "Trey Lake", "Frank Pizza", "Chaunice Devine", "Sr. IT Manager"]
            found_names = [s.get('name') for s in response]
            
            if all(name in found_names for name in expected_names):
                print("   ✅ All expected specialists found")
            else:
                print("   ⚠️  Some expected specialists missing")
                
        return success

    def test_create_ticket(self):
        """Test creating a new ticket"""
        ticket_data = {
            "title": "Printer not working in marketing department",
            "description": "HP LaserJet 5200 in marketing dept stopped printing. Error message shows 'Paper Jam' but no paper is stuck. Tried restarting printer multiple times.",
            "category": "printer",
            "priority": "high",
            "requester_name": "John Smith",
            "requester_email": "john.smith@renewalbyandersen.com",
            "requester_phone": "555-123-4567"
        }
        
        success, response = self.run_test(
            "Create Ticket",
            "POST",
            "tickets",
            200,
            data=ticket_data
        )
        
        if success and isinstance(response, dict):
            self.created_ticket_id = response.get('id')
            self.created_ticket_number = response.get('ticket_number')
            print(f"   Created ticket: {self.created_ticket_number}")
            print(f"   Ticket ID: {self.created_ticket_id}")
            
        return success

    def test_get_tickets(self):
        """Test getting all tickets"""
        success, response = self.run_test(
            "Get All Tickets",
            "GET",
            "tickets",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} tickets")
            
        return success

    def test_get_ticket_by_number(self):
        """Test getting ticket by ticket number"""
        if not self.created_ticket_number:
            print("❌ No ticket number available for testing")
            return False
            
        success, response = self.run_test(
            "Get Ticket by Number",
            "GET",
            f"tickets/{self.created_ticket_number}",
            200
        )
        
        if success and isinstance(response, dict):
            print(f"   Retrieved ticket: {response.get('ticket_number')}")
            print(f"   Status: {response.get('status')}")
            print(f"   Title: {response.get('title')}")
            
        return success

    def test_update_ticket(self):
        """Test updating ticket status"""
        if not self.created_ticket_id:
            print("❌ No ticket ID available for testing")
            return False
            
        update_data = {
            "status": "in_progress"
        }
        
        success, response = self.run_test(
            "Update Ticket Status",
            "PUT",
            f"tickets/{self.created_ticket_id}",
            200,
            data=update_data
        )
        
        if success and isinstance(response, dict):
            print(f"   Updated ticket status to: {response.get('status')}")
            
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.run_test(
            "Dashboard Statistics",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success and isinstance(response, dict):
            print(f"   Today's tickets: {response.get('total_tickets_today', 0)}")
            print(f"   Tickets in queue: {response.get('tickets_in_queue', 0)}")
            print(f"   This week: {response.get('total_tickets_week', 0)}")
            print(f"   This month: {response.get('total_tickets_month', 0)}")
            
            tickets_by_status = response.get('tickets_by_status', {})
            if tickets_by_status:
                print(f"   Status breakdown: {tickets_by_status}")
                
            tickets_by_specialist = response.get('tickets_by_specialist', {})
            if tickets_by_specialist:
                print(f"   Specialist workload: {tickets_by_specialist}")
            
        return success

def main():
    print("🚀 Starting IT Ticketing System API Tests")
    print("=" * 50)
    
    tester = ITTicketingAPITester()
    
    # Run all tests in sequence
    tests = [
        tester.test_api_root,
        tester.test_get_specialists,
        tester.test_dashboard_stats,
        tester.test_create_ticket,
        tester.test_get_tickets,
        tester.test_get_ticket_by_number,
        tester.test_update_ticket,
        tester.test_dashboard_stats,  # Test again to see updated stats
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())