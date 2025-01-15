import random
import subprocess
from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allowed origins
origins = [
    "http://localhost:3000",  # Frontend origin
    "run-",  # Alternate localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific origins
    allow_credentials=True,  # Allow cookies and auth headers
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)@app.post("/run-script")
async def run_script(numbers: dict = Body(...)):
    try:
        number1 = numbers.get("number1")
        number2 = numbers.get("number2")
        subprocess.Popen(["python", "hand_tracking.py", str(number1), str(number2)])
        return {"status": "success", "message": "Script started successfully with numbers", "numbers": numbers}
    except Exception as e:
        return {"status": "error", "error": str(e)}

    

@app.get("/get-number")
async def generate_random_number():
    number1 = random.randint(1, 20)
    number2 = random.randint(1, 20)
    return {"number1": number1, "number2": number2}

