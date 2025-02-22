# FinTech-A-Thon
---

# AI-Driven Scam Call Detection 
**“Real-Time Fraud Call Prediction”**

## Table of Contents
- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Folder Structure](#folder-structure)  
- [Getting Started](#getting-started)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)

## ScreenShots
![Server Side](images/Screenshot%202025-02-22%20121332.jpg)
![Client Side](images/Screenshot%202025-02-22%20121421.jpg)


## Overview

> This application is designed to manage and analyze real-time calls using **FastAPI**, **PyTorch**, and **Windows Speech Recognizer**. It offers an intuitive frontend built with **HTML**, **CSS**, and **JavaScript** that leverages **WebSockets** and **WebRTC** for live communication. The system can handle speech recognition, real-time call transcription, and Fraud Detection seamlessly.

## Limitation of Twilio

Due to inherent limitations and compliance policies, Twilio does not support direct recording of user calls. As a result, this project simulates call data using WebSockets to demonstrate real-time fraud detection and transcription features.

## Important Note on Call Simulation

Due to policy or legal restrictions, **actual call recording** is not implemented in this project. Instead, we **simulate calls** using sockets for demonstration purposes. This allows us to showcase our **Fraud Detection System** without violating any regulations regarding call recording.

> **Integration Possibility:** Authorized entities (such as telecom providers or law enforcement agencies) could adapt and integrate this solution into their systems, provided they comply with all relevant legal and policy requirements.

## Features
- **Real-Time Call Handling:** Supports incoming/outgoing calls with minimal latency.  
- **Speech Recognition:** Leverages **Windows Speech Recognizer** for accurate transcription.  
- **AI/ML Integration:** Uses **PyTorch** for advanced analytics or potential ML-based features (e.g., sentiment analysis or scam detection).  
- **WebSocket Communication:** Ensures real-time updates between client and server.  
- **WebRTC Support:** Enables real-time audio/video streaming directly in the browser.  
- **FastAPI Backend:** Simple, fast, and efficient server setup.  
- **Modular Codebase:** Clear separation between frontend and backend for easy maintenance.

## Tech Stack
- **Python** (3.x)  
- **FastAPI**  
- **PyTorch**  
- **JavaScript**  
- **WebSockets**  
- **WebRTC**  
- **HTML / CSS**  
- **Windows Speech Recognizer**  

## Folder Structure

```
.
├── backend
│   ├── __init__.py
│   ├── call_manager.py       # Main call handling logic
│   ├── requirements.txt      # Python dependencies
│   ├── server.py             # FastAPI server configuration
│   └── utils.py              # Utility functions
├── frontend
│   ├── app.js                # Main client-side logic (WebSocket / WebRTC)
│   ├── index.html            # Frontend entry point
│   ├── styles.css            # Styling for the frontend
├── .gitignore
└── README.md                 # Project documentation
```

> **Note:** Adjust file names and descriptions to reflect your actual implementation details.

## Getting Started

### Prerequisites
- **Python 3.x**  
- **pip** (or another Python package manager)  
- A supported environment for **Windows Speech Recognizer** (typically Windows OS)  
- Node.js (if you plan to manage any frontend dependencies using npm or yarn)

### Installation

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/SuryaSekharSingh/Fintech-A-Thon.git
   cd YourProjectName
   ```

2. **Set Up the Backend**  
   - Navigate to the `backend` folder:  
     ```bash
     cd backend
     ```
   - Create and activate a virtual environment (optional):  
     ```bash
     python -m venv venv
     source venv/bin/activate  # On Windows: venv\Scripts\activate
     ```
   - Install the required dependencies:  
     ```bash
     pip install -r requirements.txt
     ```

3. **Set Up the Frontend**  
   - If you have any frontend build steps, run them here.  
   - Otherwise, confirm that `index.html`, `app.js`, and `styles.css` are in the correct directory.

## Usage

1. **Run the Backend (FastAPI)**  
   From the `backend` directory, run:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 5060
   ```
   AND the backend:
   ```bash
   python server.py
   ```
   The server should start on `http://localhost:5060` by default.

2. **Open the Frontend**  
     From the `frontend` directory, run:
      ```bash
      python -m http.server {port}
      ```
      - To run this on your local network you have to change the ip in server.py and app.js.


3. **Initiate a Call**  
   - Once the server is running, open the frontend in your browser.  
   - Click on the “Start Call” or relevant button to initialize the WebRTC connection and start streaming.  
   - The app should capture audio (and possibly video if configured) and route it to the backend for processing via **Windows Speech Recognizer** and any additional PyTorch-based modules.

4. **Real-Time Transcription/Analysis**  
   - View real-time transcriptions, call analytics, or other features as they become available in the UI.

## Contributing
Contributions are welcome! If you’d like to contribute, please follow these steps:
1. Fork the repository.  
2. Create a new branch: `git checkout -b feature/your-feature-name`.  
3. Make your changes and commit them: `git commit -m 'Add some feature'`.  
4. Push to the branch: `git push origin feature/your-feature-name`.  
5. Submit a pull request.
   

## Contact
Created by [ TEAM SHADOW ](https://github.com/SuryaSekharSingh) – feel free to contact us!  

---

*Thank you for checking out this project. If you find it helpful, consider giving a star on GitHub!*
