from flask import Blueprint, request, jsonify
from targetai import TargetAITokenClient
from retell import Retell
import time
from datetime import datetime, timedelta

connectionDetails_bp = Blueprint('connectionDetails', __name__)

# Configuration for all providers
PROVIDERS_CONFIG = {
    'targetai': {
        'tos_base_url': 'https://app.targetai.ai',
        'api_key': 'sk_PL3oEjtB97GDwi3o3fEVS0VF7sRHGnyu',
        'agent_uuid': '3af19e89-3253-4a8d-a1e3-cd3872291e4a',
        'allowedResponses': ['voice'],
        'emitRawAudioSamples': True,
        'messages': [
            {
                'role': 'user',
                'content': 'You are a helpful voice assistant.'
            }
        ],
        'dataInput': {
            'name': 'John Doe',
            'language': 'ru'
        }
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

@connectionDetails_bp.route('/connectionDetails', methods=['POST'])
def get_token():
    """
    Universal token endpoint that supports multiple voice assistant providers.
    
    Request body should include:
    {
        "provider": "targetai" | "retell" | "livekit",
        "user_id": "optional_user_id",
        "room_name": "optional_room_name" (for LiveKit),
        "participant_name": "optional_participant_name" (for LiveKit)
    }
    """
    try:
        data = request.get_json() or {}
        provider = data.get('provider', 'retell').lower()
        company_id = data.get('company_id', f'comapny_{int(time.time())}')
        
        if provider not in PROVIDERS_CONFIG:
            return jsonify({
                'error': f'Unsupported provider: {provider}',
                'supported_providers': list(PROVIDERS_CONFIG.keys())
            }), 400
        
        if provider == 'targetai':
            return handle_targetai_token(data, company_id)
        elif provider == 'retell':
            return handle_retell_token(data, company_id)
        elif provider == 'livekit':
            return handle_livekit_token(data, company_id)
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

def handle_targetai_token(data, company_id):
    """Handle TargetAI token generation"""
    print("handle_targetai_token", data, company_id)
    try:
        config = PROVIDERS_CONFIG['targetai']
        return jsonify({
            'provider': 'targetai',
            'server_url': config['tos_base_url'],
            'agent_uuid': config['agent_uuid'],
            'user_id': company_id,
            'expires_in': 1800,
            'allowedResponses': config['allowedResponses'],
            'emitRawAudioSamples': config['emitRawAudioSamples'],
            'messages': config['messages'],
            'dataInput': config['dataInput'],
            'ok': True
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate TargetAI token',
            'message': str(e)
        }), 500

def handle_retell_token(data, user_id):
    """Handle Retell token generation (placeholder implementation)"""
    config = PROVIDERS_CONFIG['retell']
    
    if config['api_key'] == 'YOUR_RETELL_API_KEY_HERE':
        return jsonify({
            'error': 'Retell API key not configured',
            'message': 'Please configure RETELL_API_KEY in the server configuration'
        }), 501
    
    retell_client = Retell(api_key=config['api_key'])
        
    web_call_response = retell_client.call.create_web_call(agent_id=config['agent_id'])
    return jsonify({
        'provider': 'retell',
        'access_token': web_call_response.access_token,
        'agent_id': config['agent_id'],
        'user_id': user_id,
    })

def handle_livekit_token(data, user_id):
    """Handle LiveKit token generation (placeholder implementation)"""
    config = PROVIDERS_CONFIG['livekit']
    
    if config['api_key'] == 'YOUR_LIVEKIT_API_KEY_HERE':
        return jsonify({
            'error': 'LiveKit API key not configured',
            'message': 'Please configure LIVEKIT_API_KEY and LIVEKIT_API_SECRET in the server configuration'
        }), 501
    
    room_name = data.get('room_name', f'room_{user_id}')
    participant_name = data.get('participant_name', user_id)
    
    # TODO: Implement actual LiveKit token generation using livekit-server-sdk-python
    # This would typically involve:
    # from livekit import AccessToken, VideoGrant
    # token = AccessToken(config['api_key'], config['api_secret'])
    # token.with_identity(participant_name)
    # token.with_grants(VideoGrant(room_join=True, room=room_name))
    # jwt_token = token.to_jwt()
    
    return jsonify({
        'provider': 'livekit',
        'participant_token': 'placeholder_livekit_token',
        'server_url': config['server_url'],
        'room_name': room_name,
        'participant_name': participant_name,
        'user_id': user_id,
        'expires_in': 3600,
        'note': 'This is a placeholder implementation. Configure LiveKit credentials to use.'
    })

