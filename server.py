import json
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import laya

app = FastAPI(title="Laya 421M Local Decision Server")

# Enable CORS for the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading Laya ModernBERT 421M weights from local Hugging Face cache...")
agent = laya.load("convaiinnovations/laya")
print("[OK] Laya 421M Decision Engine loaded and ready on http://127.0.0.1:8000")

@app.get("/health")
def health():
    return {"status": "ok", "model": "convaiinnovations/laya-modernbert-421m"}

@app.post("/v1/systemone")
async def evaluate_system_one(request: Request):
    body = await request.json()
    state = body.get("state", {})
    raw_questions = body.get("questions", {})

    # Build rich semantic state description for Laya's ModernBERT attention heads
    if isinstance(state, dict):
        stage_name = state.get("current_stage", "Cube State")
        subgoal = state.get("active_subgoal", "")
        rule = state.get("rule", "")
        state_str = f"Speedcubing Solver State: {stage_name}. Current Subgoal: {subgoal}. Speedcuber Rule: {rule}."
    else:
        state_str = str(state)

    # Convert incoming questions to laya.predict format
    laya_questions = {}
    for q_id, q_spec in raw_questions.items():
        q_type = q_spec.get("type", "choice")
        if q_type == "choice":
            criteria_dict = q_spec.get("criteria")
            if not criteria_dict:
                choices = q_spec.get("choices") or q_spec.get("candidate_algorithms") or []
                if isinstance(choices, dict):
                    criteria_dict = choices
                elif isinstance(choices, list):
                    criteria_dict = {c: f"Apply {c} to resolve current state" for c in choices}
                else:
                    criteria_dict = {"option_0": str(choices)}

            instructions = q_spec.get("instructions", "Select the best speedcubing algorithm for the given cube state.")
            laya_questions[q_id] = {
                "type": "choice",
                "instructions": instructions,
                "criteria": criteria_dict,
            }
    stage_name = state.get("current_stage", "Cube State") if isinstance(state, dict) else "Cube State"

    # If already solved, return immediately without running ModernBERT
    if "solved" in stage_name.lower() or "identity" in stage_name.lower():
        print("[LAYA 421M] Cube is solved. No inference needed.")
        return {
            "model": "convaiinnovations/laya-modernbert-421m",
            "latency_ms": 0.0,
            "answers": {
                "selected_algorithm": {
                    "answer": "Cube Solved (Identity)",
                    "confidence": 1.0,
                    "probabilities": {"Cube Solved (Identity)": 1.0},
                }
            },
            "usage": {},
        }

    # If client navigated away or aborted, drop the request
    if await request.is_disconnected():
        print(f"[LAYA 421M] Request for '{stage_name}' dropped (client disconnected).")
        return {"status": "dropped"}

    start_time = time.perf_counter()
    pred = agent.predict(state_str, laya_questions)
    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

    # Map answers back to frontend schema
    formatted_answers = {}
    answers = pred.get("answers", {})
    for q_id, ans in answers.items():
        raw_choice = ans.get("choice", "")
        raw_probs = ans.get("probabilities", {})
        
        mapped_probs = {}
        for k, p in raw_probs.items():
            mapped_probs[k] = round(float(p), 4)

        conf = ans.get("answer_confidence", ans.get("confidence", 0.95))
        formatted_answers[q_id] = {
            "answer": raw_choice,
            "confidence": round(float(conf), 4),
            "probabilities": mapped_probs,
        }

    stage_title = state.get("current_stage", "Cube State") if isinstance(state, dict) else "Cube State"
    step_num = state.get("step_index", 1) if isinstance(state, dict) else 1
    total_num = state.get("total_steps", 1) if isinstance(state, dict) else 1
    target_piece = state.get("target_piece", "") if isinstance(state, dict) else ""
    piece_str = f" [{target_piece}]" if target_piece else ""

    algo_ans = formatted_answers.get("selected_algorithm", {})
    winning_algo = algo_ans.get("answer", list(formatted_answers.values())[0]["answer"] if formatted_answers else "N/A")
    conf = algo_ans.get("confidence", 0.95)

    print(f"\n[LAYA 421M NEURAL INFERENCE] Step {step_num}/{total_num} • {stage_title}{piece_str}")
    print(f"  -> Winning Algorithm: {winning_algo} ({conf * 100:.1f}% Calibrated Confidence)")
    print(f"  -> Real ModernBERT Latency: {latency_ms} ms")
    print(f"  -> Softmax Probabilities: {algo_ans.get('probabilities', {})}")

    return {
        "model": "convaiinnovations/laya-modernbert-421m",
        "latency_ms": latency_ms,
        "answers": formatted_answers,
        "usage": pred.get("usage", {}),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
