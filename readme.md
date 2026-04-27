### Run the backend server

go to the backend dir
```
cd backend 
```

sync dependencies
```
uv venv or python -m env .venv

# activate it
source .venv/bin/activate

uv sync or pip install -r requirements.txt
```

Start backend server
``` 
uv run uvicorn app.main:app --reload --port 8000
```

### Run frontend

go to the frontend dir
```
cd frontend
```

Install node packages
```
npm install
```

Start frontend server
```
npm run dev
```



