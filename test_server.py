import time
import requests

payload = {
    "state": {"stage": "Stage 2: White Corners", "target": "White-Blue-Red Corner"},
    "questions": {
        "algo": {
            "type": "choice",
            "instructions": "Which algorithm resolves this corner slot?",
            "choices": [
                "The Righty Algorithm (R U R' U')",
                "The Lefty Algorithm (L' U' L U)",
                "The Sune Algorithm (R U R' U R U2 R')",
                "The Niklas Algorithm (U R U' L' U R' U' L)"
            ]
        }
    }
}

try:
    start = time.perf_counter()
    res = requests.post("http://127.0.0.1:8000/v1/systemone", json=payload, timeout=5)
    elapsed = round((time.perf_counter() - start) * 1000, 2)
    print("Response status:", res.status_code)
    print("Response time:", elapsed, "ms")
    print("Response body:", res.json())
except Exception as e:
    print("Server not currently running or error:", e)
