# Brain Box 🧠📦

## Overview

**Brain Box** is a compact, portable field recorder designed to capture and process electroencephalography (EEG) data autonomously in environments where traditional laboratory setups aren't feasible. The system prioritizes portability, security, and reliability by utilizing local Bluetooth communication instead of wide-area network connectivity, making it ideal for field research and real-world EEG data collection.

## 🎯 Device Concept

The system consists of three main components:

### 🔧 Hardware Components

- **STM32 Microcontroller**: Core processing unit for real-time EEG signal processing
- **Ganglion BCI Headset**: Professional-grade EEG sensor array for high-quality brain signal capture
- **Bluetooth Communication Module**: Secure, low-latency wireless data transmission

### 💻 Software Stack

- **Embedded Firmware**: Real-time signal processing and data compression on STM32
- **Desktop Application**: Data management, visualization, and analysis tools
- **Web Interface**: Modern React-based dashboard for comprehensive data review
- **Backend API**: Django-powered data processing and storage management

## 🌐 Accessing the Software

### Frontend Application

- **Live Demo**: [Coming Soon]
- **Local Development**:
  ```bash
  cd app-frontend
  npm install
  npm run dev
  ```
- **Access URL**: `http://localhost:5173`

### Backend API

- **Production**: [Link](https://brain-box-68c92647e146.herokuapp.com)
- **Local Development**:
  ```bash
  cd app-backend
  pip install -r requirements.txt
  python manage.py runserver
  ```
- **API Access**: `http://localhost:8000`

## 📱 Quick Start Guide

### 1. Hardware Setup

1. Power on the Brain Box device
2. Pair the Ganglion BCI headset via Bluetooth
3. Ensure proper electrode placement on the subject
4. Record EEG data

### 2. Data Analysis

1. Access the web interface at `localhost:5173`
2. Navigate to your recording session
3. View spectrograms, periodograms, and ERPs

## 🔧 Development Setup

### Prerequisites

- **Node.js** (v16+)
- **Python** (v3.8+)
- **Git**

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/Physlex/NatHack2025.git
cd NatHack2025

# Frontend setup
cd app-frontend
npm install
npm run dev

# Backend setup (in another terminal)
cd app-backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Access the application
open http://localhost:5173
```

## Presentation Link

[Here](https://docs.google.com/presentation/d/1LeJf0dv4BcGyRyyY71m5VS_iV2szfE3h5Gyf5muxtEQ/edit?slide=id.p#slide=id.p) is the link for the presentation.

## 🏆 Credits & Acknowledgments

### Development Team

- **Project Lead**: Alex Willet
- **Embedded Engineering**: Ayrton Chilibeck
- **Hardware/Software Interface Engineering**: Balpreet Juneja
- **Software Development**: Tammy Young, Ahmed Keshta
- **Signal Processing**: Suvir Duggal
