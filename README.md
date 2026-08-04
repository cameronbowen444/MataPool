MATAPOOL PROJECT SETUP AND GITHUB TEAM INSTRUCTIONS

Project Stack
-------------
- React + Vite for the frontend
- Django for the backend
- Django REST Framework
- django-cors-headers
- SQLite for the database


1. INSTALL THE REQUIRED SOFTWARE
--------------------------------

Everyone should have the following installed:

Git
Check with:
git --version

Node.js and npm
Check with:
node -v
npm -v

Python
Check with:
python3 --version

On Mac, you will usually use:
python3

On Windows, you may use:
python


2. CLONE THE GITHUB REPOSITORY
------------------------------

Once the project is on GitHub, each team member should run:

git clone YOUR_GITHUB_REPOSITORY_URL

Then enter the project folder:

cd MataPool


3. SET UP THE REACT FRONTEND
----------------------------

Go into the frontend folder:

cd frontend

Install all dependencies from package.json:

npm install

Run the frontend:

npm run dev

The React app should normally run at:

http://localhost:5173


4. SET UP THE DJANGO BACKEND
----------------------------

Open another terminal and go into the backend folder:

cd MataPool/backend

Create a virtual environment.

Mac:

python3 -m venv venv

Activate it:

source venv/bin/activate

Windows:

python -m venv venv

Activate it:

venv\Scripts\activate

You should see something like this at the beginning of the terminal:

(venv)


5. INSTALL THE PYTHON PACKAGES
------------------------------

Make sure the virtual environment is active.

Then run:

pip install -r requirements.txt

This installs everything needed for the Django backend.


6. SET UP THE DATABASE
----------------------

Run:

python manage.py migrate

On Mac, if needed, use:

python3 manage.py migrate

Then start Django:

python manage.py runserver

The backend should run at:

http://127.0.0.1:8000/


7. DAILY WORKFLOW
-----------------

Every time you start working, use two terminals.

Terminal 1 - React

cd frontend
npm run dev

Terminal 2 - Django

cd backend

Activate the virtual environment on Mac:

source venv/bin/activate

Activate the virtual environment on Windows:

venv\Scripts\activate

Then run:

python manage.py runserver


8. GITHUB TEAM SETUP
--------------------

The repository owner should add everyone as collaborators.

On GitHub:

Repository
-> Settings
-> Collaborators
-> Add people

Add each team member by their GitHub username.

Each person must accept the GitHub invitation before they can work with the repository.


9. RECOMMENDED GIT WORKFLOW
---------------------------

Do not have everyone push directly to main.

Use feature branches such as:

feature-login
feature-profile
feature-events
feature-posts
feature-navbar


10. BEFORE STARTING WORK
------------------------

Always make sure your local main branch is updated.

git checkout main
git pull origin main

Then create a new branch:

git checkout -b feature-login


11. SAVE AND PUSH YOUR WORK
---------------------------

After making changes:

git add .
git commit -m "Add login page"
git push -u origin feature-login

Then go to GitHub and create a Pull Request from:

feature-login

into:

main

Someone should review the Pull Request before merging it.


12. AFTER SOMEONE ELSE'S CODE IS MERGED
----------------------------------------

Update your local project:

git checkout main
git pull origin main

Then create a new branch for your next feature:

git checkout -b feature-new-feature


13. IMPORTANT TEAM RULE
-----------------------

Before creating a new branch, always run:

git checkout main
git pull origin main

This helps prevent team members from starting new work with outdated code.


14. BASIC TEAM WORKFLOW
-----------------------

Pull latest main
      |
      v
Create a branch
      |
      v
Write code
      |
      v
Commit changes
      |
      v
Push branch
      |
      v
Create Pull Request
      |
      v
Review
      |
      v
Merge into main


15. RECOMMENDED GITHUB SETTINGS
-------------------------------

Protect the main branch.

On GitHub:

Repository
-> Settings
-> Branches
-> Add branch protection rule

Choose:

main

Enable:

Require a pull request before merging

This prevents someone from accidentally pushing unfinished code directly to the main branch.


16. RECOMMENDED TEAM SETUP
--------------------------

The safest setup for this project is:

- One shared GitHub repository
- Every task is completed on a separate feature branch
- Pull Requests are used to merge code into main
- Team members pull the latest main branch before starting new work
- Team members do not directly push unfinished code to main


EXAMPLE WORKFLOW
----------------

git checkout main
git pull origin main
git checkout -b feature-events

# Make your code changes

git add .
git commit -m "Add events page"
git push -u origin feature-events

# Then create a Pull Request on GitHub

17. ENVIRONMENT VARIABLES SETUP (.env)
--------------------------------------

Because API keys and sensitive credentials are not pushed to GitHub (they are in .gitignore), you MUST manually create `.env` files in your local workspace after pulling.

Frontend (.env):
Create a file named `.env` in the `frontend` folder and add the following:

VITE_GOOGLE_CLIENT_ID=7821136417-g3lei84v4p00plv2j33o3bd6rvrjehk5.apps.googleusercontent.com
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDr7NdrI3BDq72bKobnapk0szNmKDB7PE4

Backend (.env):
Create a file named `.env` in the `backend` folder and add the following:

GOOGLE_CLIENT_ID=7821136417-g3lei84v4p00plv2j33o3bd6rvrjehk5.apps.googleusercontent.com

**IMPORTANT**: Without these keys configured locally, the Carpool Map View and Google Login features will crash.
