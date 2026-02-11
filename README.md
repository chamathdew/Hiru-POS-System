# Hiru POS System

A modern, full-stack Point of Sale (POS) and Inventory Management System designed for efficiency and ease of use. Built with a premium dark-themed UI and robust backend architecture.

## 🚀 Features

- **Store Management**: Track and manage multiple store locations.
- **Department Controls**: Organize inventory by departments.
- **Supplier Directory**: Manage supplier information and relations.
- **Stock Management**: Real-time tracking of stock levels and movements.
- **Inventory Documents**:
  - **GRN (Goods Received Note)**: Manage incoming stock.
  - **Issues**: Track stock issued to different departments.
  - **Requests**: Handle internal stock requests.
- **Items Catalog**: Detailed product/item management.
- **Dashboard**: Visual summaries and key metrics.
- **Security**: JWT-based authentication with role-based access control.
- **UI/UX**: Premium dark mode design with smooth animations using Framer Motion.

## 🛠️ Technology Stack

### Frontend
- **React 19**: Modern UI library.
- **Vite**: Ultra-fast build tool.
- **React Router Dom**: Client-side routing.
- **Framer Motion**: Advanced animations.
- **Lucide React**: Clean and consistent iconography.
- **Axios**: API communication.
- **CSS3**: Custom premium styling with dark mode.

### Backend
- **Node.js & Express**: Scalable server-side environment.
- **MongoDB & Mongoose**: Flexible NoSQL database with schema modeling.
- **Authentication**: JWT (JSON Web Tokens) and bcrypt for password hashing.
- **Validation**: Zod for type-safe schema validation.
- **PDF Generation**: PDFKit for invoices and reports.
- **Export**: JSON2CSV for data exports.

## 📦 Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB database (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/chamathdew/Hiru-POS-System.git
cd Hiru-POS-System
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

## 📄 License

This project is licensed under the MIT License.

---
Developed by [Chamath Dew](https://github.com/chamathdew)
