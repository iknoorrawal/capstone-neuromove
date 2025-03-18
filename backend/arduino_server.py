# import socketio
# from aiohttp import web
# from aiohttp_cors import setup as cors_setup, ResourceOptions
# import serial

# # Initialize Socket.IO server
# sio = socketio.AsyncServer(
#     async_mode='aiohttp',
#     cors_allowed_origins=['http://localhost:3000'],
#     logger=True,
#     engineio_logger=True
# )

# # Create web application
# app = web.Application()

# # Setup CORS
# cors = setup_cors = cors_setup(app, defaults={
#     "*": ResourceOptions(
#         allow_credentials=True,
#         expose_headers="*",
#         allow_headers="*",
#         allow_methods=["GET", "POST", "OPTIONS"]
#     )
# })

# # Attach Socket.IO
# sio.attach(app, cors_allowed_origins=['http://localhost:3000'])

# # Initialize Arduino connection
# try:
#     arduino = serial.Serial('/dev/cu.usbserial-0001', 9600, timeout=1)
#     print("✅ Successfully connected to Arduino")
# except Exception as e:
#     print(f"❌ Failed to connect to Arduino: {e}")
#     arduino = None

# # Test endpoint
# async def test_endpoint(request):
#     return web.Response(text='Server is running')

# app.router.add_get('/', test_endpoint)

# async def read_arduino(sid):
#     print(f"Starting Arduino read loop for client {sid}")
#     while True:
#         try:
#             if arduino and arduino.in_waiting:
#                 data = arduino.readline().decode().strip()
#                 left_force, right_force = map(float, data.split())
#                 print(f"📊 Data: Left={left_force}, Right={right_force}")
                
#                 await sio.emit('arduino_data', {
#                     'left': left_force,
#                     'right': right_force
#                 }, room=sid)
#             else:
#                 # Send dummy data to keep connection alive
#                 await sio.emit('arduino_data', {
#                     'left': 0,
#                     'right': 0
#                 }, room=sid)
#             await sio.sleep(0.1)
#         except Exception as e:
#             print(f"Error in read loop: {e}")
#             await sio.sleep(1)

# @sio.event
# async def connect(sid, environ):
#     print(f"🔌 Client connected: {sid}")
#     await sio.emit('connection_confirmed', {'status': 'connected'}, room=sid)
#     await read_arduino(sid)

# @sio.event
# async def disconnect(sid):
#     print(f"🔌 Client disconnected: {sid}")

# if __name__ == '__main__':
#     print("🚀 Starting server on http://localhost:8000")
#     web.run_app(app, host='127.0.0.1', port=8000) 