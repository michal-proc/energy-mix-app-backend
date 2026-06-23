# Energy Mix App

## About the Application

Energy Mix App Backend is a TypeScript API created for analyzing the UK energy mix and finding the best time to charge an electric vehicle based on the share of clean energy.

## Technology stack

* **Node.js**
* **Express**
* **TypeScript**
* **Jest**
* **Docker**
* **Yarn**

## API Endpoints

### Health Check

```http
GET /api/v1/health
```

### Get Energy Mix

```http
GET /api/v1/energy/mix?offsetDays={number?}
```

Optional query parameter:

```http
offsetDays=0
```

Returns averaged energy mix data for three consecutive days.

### Get Optimal Charging Window

```http
GET /api/v1/energy/optimal-charging-window?hours={number}&offsetDays={number?}
```

## Installation & Setup

## Running with Docker

```sh
docker build -t energy-mix-app-backend .
docker run -p 4000:4000 energy-mix-app-backend
```

### Running Locally

1. Clone the repository:

```sh
git clone https://github.com/michal-proc/energy-mix-app-backend.git
cd energy-mix-app-backend
```

2. Install dependencies:

```sh
yarn install
```

3. Create environment file:

```sh
cp .env.example .env
```

4. Start the development server:

```sh
yarn dev
```

5. The API will be available at:

```sh
http://localhost:4000
```

## Running Tests

```sh
yarn test
```


