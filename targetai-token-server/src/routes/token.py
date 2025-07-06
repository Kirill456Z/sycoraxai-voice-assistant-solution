from flask import Blueprint, request, jsonify
from targetai import TargetAITokenClient
from retell import Retell
import os
import jwt
import time
from datetime import datetime, timedelta
import asyncio

token_bp = Blueprint('token', __name__)

# Configuration for all providers
PROVIDERS_CONFIG = {
    'targetai': {
        'tos_base_url': 'https://app.targetai.ai',
        'api_key': 'sk_PL3oEjtB97GDwi3o3fEVS0VF7sRHGnyu',
        'agent_uuid': '3af19e89-3253-4a8d-a1e3-cd3872291e4a',
        'allowedResponses': ['voice'],
        'emitRawAudioSamples': True
    },
    'retell': {
        'api_key': 'key_3ac0bb77521c7602b840730a6b00',
        'agent_id': 'agent_e04f3277286469fd520838468a'
    },
    'livekit': {
        'api_key': 'YOUR_LIVEKIT_API_KEY_HERE',  # Placeholder
        'api_secret': 'YOUR_LIVEKIT_API_SECRET_HERE',  # Placeholder
        'server_url': 'wss://your-livekit-server.com'  # Placeholder
    }
}


async def generate_token():
    async with TargetAITokenClient(
        tos_base_url="https://app.targetai.ai",
        api_key="sk_PL3oEjtB97GDwi3o3fEVS0VF7sRHGnyu",
    ) as client:
        return await client.get_token()


@token_bp.route('/token', methods=['POST'])
def get_token():
    """
    Token endpoint tp generate targetAI token.

    """
    try:
        token_response = asyncio.run(generate_token())
        print("token_response", token_response)
        return jsonify({
            'provider': 'targetai',
            'token': token_response.token,
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate TargetAI token',
            'message': str(e)
        }), 500

