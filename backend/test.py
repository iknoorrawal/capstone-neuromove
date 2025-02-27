import socketio
from aiohttp import web

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='aiohttp',
    cors_allowed_origins='*'  # Allow all origins for testing
)

# Create web app
app = web.Application()
sio.attach(app)

# Test endpoint
async def test(request):
    return web.Response(text='Server is running')

app.router.add_get('/', test)

# Socket.IO events
@sio.event
async def connect(sid, environ):
    print(f'Client connected: {sid}')
    await sio.emit('test', {'data': 'Connected successfully!'}, room=sid)

@sio.event
async def disconnect(sid):
    print(f'Client disconnected: {sid}')

# Start server
if __name__ == '__main__':
    web.run_app(app, host='127.0.0.1', port=8000)