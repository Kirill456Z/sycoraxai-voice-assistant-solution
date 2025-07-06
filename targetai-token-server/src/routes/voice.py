import os, requests
from flask import Blueprint, request, Response, jsonify
from datetime import datetime
import logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("voice-proxy")

voice_bp = Blueprint("voice", __name__)

TARGETAI_URL = "https://app.targetai.ai/run/voice/offer"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer {}",          # filled in at runtime
}

@voice_bp.route("/run/voice/offer", methods=["POST"])
def forward_offer():
    auth = request.headers.get("Authorization")
    if not auth:
        return jsonify({"error": "Missing Authorization header"}), 400

    try:
        resp = requests.post(
            TARGETAI_URL,
            headers={
                "Authorization": auth,
                "Content-Type": "application/json",
            },
            json=request.get_json()
        )
        print(f"Response: {resp.content}")
        # Relay TargetAI’s status code & body verbatim
        return Response(
            resp.content,
            status=resp.status_code,
            headers={"Content-Type": resp.headers.get("Content-Type", "application/json")},
        )
    except Exception as exc:
        log.exception("TargetAI proxy failed")
        return jsonify({"error": "failed to reach TargetAI", "detail": str(exc)}), 502
