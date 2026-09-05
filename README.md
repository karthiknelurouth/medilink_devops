# MediLink

MediLink is a hospital resource and emergency coordination platform designed to help hospitals manage resources, inventory, patient transfers, shortage prediction, and disease-related trends.

---

## Features

* Hospital resource dashboard
* Inventory management
* Patient transfer management
* Hospital statistics
* Shortage prediction
* Disease prediction
* Role-based login
* Admin and hospital-specific views
* MySQL database integration
* REST API using Node.js and Express

---

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL

---

# Local Setup

## 1. Clone the Repository

```bash
git clone https://github.com/karthiknelurouth/medilink_devops.git
```

Move into the project:

```bash
cd medilink_devops
```

---

## 2. Install Backend Dependencies

Move into the backend folder:

```bash
cd backend
```

Install the required packages:

```bash
npm install
```

---

## 3. Configure MySQL

Make sure MySQL is installed and running.

Create a MySQL database for MediLink.

Example:

```sql
CREATE DATABASE medilink;
```

The project uses tables for:

* users
* inventory
* transfers
* hospital_stats

Import the database SQL file from the repository if one is provided.

Example:

```bash
mysql -u root -p medilink < database.sql
```

Replace `database.sql` with the actual SQL file name if different.

---

## 4. Create the Environment File

Inside the `backend` folder, create:

```text
.env
```

Add:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=medilink
PORT=8000
```

Replace:

```text
your_mysql_password
```

with your actual MySQL password.

> Do not commit real database passwords or other secrets to GitHub.

---

## 5. Start the Backend

From the `backend` directory:

```bash
npm start
```

The server should start on:

```text
http://localhost:8000
```

A successful startup should show something similar to:

```text
Server running on port 8000
Database connected successfully
```

---

# Deployment

The backend and MySQL database can be deployed using platforms such as Railway or Render.

The following instructions use **Railway**.

---

## Deploy Using Railway

### 1. Sign In

Create/sign in to a Railway account and connect your GitHub account.

---

### 2. Create a Project

Create a new Railway project and select:

```text
Deploy from GitHub repo
```

Select:

```text
medilink_devops
```

---

### 3. Configure the Backend

Because the Node.js application is inside the `backend` directory, set the service's **Root Directory** to:

```text
/backend
```

Railway should detect the Node.js application and install the packages automatically.

The start command should be:

```bash
npm start
```

---

## 4. Add MySQL

Inside the same Railway project:

```text
New Service
      ↓
Database
      ↓
MySQL
```

Railway will create a hosted MySQL database.

---

## 5. Configure Environment Variables

Open the MySQL service and obtain the database credentials.

Then open the MediLink backend service and add the corresponding environment variables:

```env
DB_HOST=your_railway_mysql_host
DB_USER=your_railway_mysql_user
DB_PASSWORD=your_railway_mysql_password
DB_NAME=your_railway_mysql_database
```

For the port, the backend should support Railway's automatically supplied `PORT`.

The server should use:

```javascript
const PORT = process.env.PORT || 8000;
```

Do **not** manually assign Railway's public application port.

---

## 6. Import the Database

The Railway MySQL database initially needs the MediLink tables and required data.

Use the Railway MySQL credentials to connect to the database using a MySQL client.

Then import the project's SQL database file.

Example:

```bash
mysql -h HOST -u USER -p DATABASE_NAME < database.sql
```

Enter the Railway database password when prompted.

---

## 7. Generate a Public Domain

Once deployment succeeds:

```text
Backend Service
      ↓
Settings
      ↓
Networking
      ↓
Generate Domain
```

Railway will provide a public URL similar to:

```text
https://your-app.up.railway.app
```

This becomes the deployed backend URL.

---

# Frontend Configuration

If the frontend contains API URLs such as:

```javascript
http://localhost:8000
```

they must be replaced with the deployed backend URL when deploying the frontend.

For example:

```javascript
https://your-app.up.railway.app
```

Do not leave production frontend requests pointing to `localhost`.

---

# Important Before Deployment

Check the following before deploying:

```text
✓ npm install works
✓ npm start works
✓ MySQL connects successfully
✓ .env is not committed with real passwords
✓ Required database tables are imported
✓ PORT uses process.env.PORT
✓ Frontend API URLs point to the deployed backend
```

---

# Project Structure

The repository is generally organised as:

```text
medilink_devops/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── ...
│
├── frontend/
│   └── ...
│
├── .gitignore
└── README.md
```

The exact files inside each directory may vary as development continues.

---

# Collaborator Workflow

Clone the repository:

```bash
git clone https://github.com/karthiknelurouth/medilink_devops.git
```

Get the latest changes:

```bash
git pull origin main
```

After making changes:

```bash
git add .
git commit -m "Describe changes"
git push origin main
```

Collaborators with write access to the repository can push changes directly.

---

# Troubleshooting

### Database connection failed

If you see:

```text
Access denied for user
```

check:

```env
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
```

and make sure they match the actual MySQL credentials.

---

### npm start fails

Run:

```bash
npm install
```

and then:

```bash
npm start
```

---

### Application works locally but not after deployment

Check:

* Railway environment variables
* MySQL connection information
* Backend deployment logs
* `process.env.PORT`
* Frontend API URLs
* CORS configuration

---

## Repository

GitHub:

```text
https://github.com/karthiknelurouth/medilink_devops
```

---

## Contributors

Developed collaboratively as part of the MediLink project.
