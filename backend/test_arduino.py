import requests
import time

def test_arduino_endpoint():
    url = "http://localhost:8000/api/arduino/read"
    
    # Test multiple readings
    for _ in range(5):
        response = requests.get(url)
        data = response.json()
        print("Response:", data)
        print(f"Left Sensor: {data.get('left_sensor')}")
        print(f"Right Sensor: {data.get('right_sensor')}")
        print(f"Connected: {data.get('connected')}")
        print("---")
        time.sleep(1)  # Wait 1 second between readings

if __name__ == "__main__":
    test_arduino_endpoint() 