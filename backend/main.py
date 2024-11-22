from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allowed origins
origins = [
    "http://localhost:3000",  # Frontend origin
    "http://127.0.0.1:8000",  # Alternate localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific origins
    allow_credentials=True,  # Allow cookies and auth headers
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/testing")
def read_root():
    return {"message": "WAHOOOOOOOOOOO"}
