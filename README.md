# Mini CRM - Client Lead Management System

Mini CRM is a web-based Client Lead Management System designed to help businesses manage client leads in one place.

It allows an admin to add, view, edit, delete, search and filter leads, update lead status and maintain follow-up notes.

## Features

- Admin login
- JWT-based authentication
- Secure password hashing using bcrypt
- Dashboard with lead statistics
- Add new leads
- View lead details
- Edit leads
- Delete leads
- Change lead status
- Add follow-up notes
- Search leads by name, email or company
- Filter leads by status
- Filter leads by source
- Responsive dashboard
- Data stored in local MongoDB

## Technologies Used

### Frontend
- HTML
- CSS
- Vanilla JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Official MongoDB Node.js Driver

### Authentication
- JSON Web Token (JWT)
- bcrypt

## Project Structure

```text
CRM
│
├── middleware
│   └── authMiddleware.js
│
├── routes
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   └── leadRoutes.js
│
├── public
│   ├── index.html
│   ├── login.html
│   ├── login.js
│   ├── script.js
│   └── style.css
│
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── server.js

The application runs at:

http://localhost:5000

Login page:

http://localhost:5000/login.html

Database

The project uses local MongoDB.

MongoDB URL:

mongodb://127.0.0.1:27017

Database name:
miniCRM
