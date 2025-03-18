import firebase_admin
from firebase_admin import credentials, firestore
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import pytz
import io
import os

# Initialize Firebase (do this only once)
cred = credentials.Certificate("/Users/iknoorrawal/Downloads/service-key.json")
try:
    firebase_admin.initialize_app(cred)
except ValueError:
    pass  # App already initialized

db = firestore.client()

def format_timestamp(timestamp):
    if timestamp:
        # Convert to UTC-5 timezone
        eastern = pytz.timezone('America/New_York')  # UTC-5
        local_time = timestamp.astimezone(eastern)
        return local_time.strftime('%Y-%m-%d')
    return ""

def create_game1_graph(game1_details):
    plt.figure(figsize=(10, 6))
    
    # Process Game 1 data
    game_data = []
    for game in game1_details:
        timestamp = game.get("timestamp")
        if timestamp:
            correct = game.get("correct_count", 0)
            incorrect = game.get("incorrect_count", 0)
            total = correct + incorrect
            if total > 0:
                performance = (correct/total * 100)
                # Convert timestamp to local time
                local_time = timestamp.astimezone(pytz.timezone('America/New_York'))
                game_data.append((local_time, performance))
                print(f"Game 1 data point: Date={local_time.strftime('%Y-%m-%d %H:%M:%S %Z')}, Performance={performance:.1f}%")
    
    # Sort data by date
    game_data.sort(key=lambda x: x[0])
    dates = [item[0] for item in game_data]
    performances = [item[1] for item in game_data]
    
    # Plot the data
    if performances:
        plt.plot(dates, performances, 'b.-', markersize=10)
    
    plt.gcf().autofmt_xdate()  # Rotate and align the tick labels
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    
    plt.title('Game 1 Performance Trend')
    plt.xlabel('Date')
    plt.ylabel('Performance (%)')
    plt.grid(True)
    
    # Save plot to memory
    img_data = io.BytesIO()
    plt.savefig(img_data, format='png', bbox_inches='tight', dpi=300)
    img_data.seek(0)
    plt.close()
    
    return img_data

def create_game3_graph(game3_details):
    plt.figure(figsize=(10, 6))
    
    # Process Game 3 data
    game_data = []
    for game in game3_details:
        timestamp = game.get("timestamp")
        if timestamp:
            correct = game.get("correct_count", 0)
            incorrect = game.get("incorrect_count", 0)
            total = correct + incorrect
            if total > 0:
                performance = (correct/total * 100)
                # Convert timestamp to local time
                local_time = timestamp.astimezone(pytz.timezone('America/New_York'))
                game_data.append((local_time, performance))
                print(f"Game 3 data point: Date={local_time.strftime('%Y-%m-%d %H:%M:%S %Z')}, Performance={performance:.1f}%")
    
    # Sort data by date
    game_data.sort(key=lambda x: x[0])
    dates = [item[0] for item in game_data]
    performances = [item[1] for item in game_data]
    
    # Plot the data
    if performances:
        plt.plot(dates, performances, 'r.-', markersize=10)
    
    plt.gcf().autofmt_xdate()  # Rotate and align the tick labels
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    
    plt.title('Game 3 Performance Trend')
    plt.xlabel('Date')
    plt.ylabel('Performance (%)')
    plt.grid(True)
    
    # Save plot to memory
    img_data = io.BytesIO()
    plt.savefig(img_data, format='png', bbox_inches='tight', dpi=300)
    img_data.seek(0)
    plt.close()
    
    return img_data

def generate_pdf_report(user_info, game1_details, game3_details):
    # Sort game details by date
    game1_details.sort(key=lambda x: x.get("timestamp"))
    game3_details.sort(key=lambda x: x.get("timestamp"))
    
    doc = SimpleDocTemplate("user_report.pdf", pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    # Title with user's first name
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=10  # Reduced space after title to accommodate subtitle
    )
    title = f"NeuroMove {user_info.get('firstName', '')} Performance Report"
    elements.append(Paragraph(title, title_style))

    # Calculate date range from all available data
    all_timestamps = []
    for game in game1_details + game3_details:
        timestamp = game.get("timestamp")
        if timestamp:
            all_timestamps.append(timestamp)

    if all_timestamps:
        # Convert timestamps to Eastern Time
        eastern = pytz.timezone('America/New_York')
        start_date = min(all_timestamps).astimezone(eastern)
        end_date = max(all_timestamps).astimezone(eastern)
        
        # Create subtitle with date range
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=14,
            textColor=colors.gray,
            alignment=1,  # Center alignment
            spaceAfter=30
        )
        date_range = f"Data displayed from {start_date.strftime('%B %d, %Y')} to {end_date.strftime('%B %d, %Y')}"
        elements.append(Paragraph(date_range, subtitle_style))
    else:
        elements.append(Spacer(1, 30))

    # 1. User Information Section
    elements.append(Paragraph("User Information", styles["Heading2"]))
    user_data = [
        ["First Name:", user_info.get("firstName", "")],
        ["Last Name:", user_info.get("lastName", "")],
        ["Height:", user_info.get("height", "")],
        ["Weight:", user_info.get("weight", "")],
        ["Email:", user_info.get("email", "")]
    ]
    user_table = Table(user_data, colWidths=[2*inch, 4*inch])
    user_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(user_table)
    elements.append(Spacer(1, 30))

    # 2. Game 1 Section
    elements.append(Paragraph("Game 1 Details", styles["Heading2"]))
    elements.append(Spacer(1, 10))
    
    # Game 1 Graph
    if game1_details:
        graph_data = create_game1_graph(game1_details)
        img = Image(graph_data, width=7*inch, height=4*inch)
        elements.append(img)
        elements.append(Spacer(1, 20))
        
        # Game 1 Table
        game1_data = [[
            "Date", "Level", "Score", "Correct", "Incorrect", "Performance"
        ]]
        for game in game1_details:
            correct = game.get("correct_count", 0)
            incorrect = game.get("incorrect_count", 0)
            total = correct + incorrect
            performance = f"{(correct/total * 100):.1f}%" if total > 0 else "0%"
            
            timestamp = game.get("timestamp")
            date = format_timestamp(timestamp)
            
            game1_data.append([
                date,
                str(game.get("level", "")),
                str(game.get("score", "")),
                str(correct),
                str(incorrect),
                performance
            ])
        game1_table = Table(game1_data, colWidths=[2*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.8*inch, 1*inch])
        game1_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(game1_table)
    else:
        elements.append(Paragraph("No Game 1 data available", styles["Normal"]))
    elements.append(Spacer(1, 30))

    # 3. Game 3 Section
    elements.append(Paragraph("Game 3 Details", styles["Heading2"]))
    elements.append(Spacer(1, 10))
    
    # Game 3 Graph
    if game3_details:
        graph_data = create_game3_graph(game3_details)
        img = Image(graph_data, width=7*inch, height=4*inch)
        elements.append(img)
        elements.append(Spacer(1, 20))
        
        # Game 3 Table
        game3_data = [[
            "Date", "Level", "Score", "Correct", "Incorrect", "Performance"
        ]]
        for game in game3_details:
            correct = game.get("correct_count", 0)
            incorrect = game.get("incorrect_count", 0)
            total = correct + incorrect
            performance = f"{(correct/total * 100):.1f}%" if total > 0 else "0%"
            
            timestamp = game.get("timestamp")
            date = format_timestamp(timestamp)
            
            game3_data.append([
                date,
                str(game.get("level", "")),
                str(game.get("score", "")),
                str(correct),
                str(incorrect),
                performance
            ])
        game3_table = Table(game3_data, colWidths=[2*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.8*inch, 1*inch])
        game3_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(game3_table)
    else:
        elements.append(Paragraph("No Game 3 data available", styles["Normal"]))

    doc.build(elements)

def generate_report_for_user(uid: str) -> str:
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise ValueError("User not found")

    user_data = user_doc.to_dict()
    user_info = {
        "firstName": user_data.get("firstName"),
        "lastName": user_data.get("lastName"),
        "height": user_data.get("height"),
        "weight": user_data.get("weight"),
        "email": user_data.get("email")
    }
    
    # Get Game 1 data
    game1_ref = user_ref.collection("game1")
    game1_docs = game1_ref.stream()
    game1_details = []
    for doc in game1_docs:
        data = doc.to_dict()
        game_data = {
            "correct_count": data.get("correct_count"),
            "incorrect_count": data.get("incorrect_count"),
            "score": data.get("score"),
            "timestamp": data.get("timestamp"),
            "level": data.get("level")
        }
        game1_details.append(game_data)

    # Get Game 3 data
    game3_ref = user_ref.collection("game3")
    game3_docs = game3_ref.stream()
    game3_details = []
    for doc in game3_docs:
        data = doc.to_dict()
        game_data = {
            "correct_count": data.get("correct_count"),
            "incorrect_count": data.get("incorrect_count"),
            "score": data.get("score"),
            "timestamp": data.get("timestamp"),
            "level": data.get("level")
        }
        game3_details.append(game_data)

    # Generate PDF report
    pdf_path = f"temp_{uid}.pdf"
    generate_pdf_report(user_info, game1_details, game3_details)
    
    return pdf_path
