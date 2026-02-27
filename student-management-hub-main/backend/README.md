# Backend Instructions

This directory contains the Express.js server for the Student Management Hub.

## Setup

1. Copy `.env.example` (if available) to `.env` and set PostgreSQL connection settings.
2. Run `npm install` inside `backend`.
3. Start the server with `npm run start`.

## Database migrations

A simple migrations folder is included under `backend/migrations`.

To update your database schema when fields are added or changed, execute the SQL files in order. For example:

```sh
# from the project root or backend folder
docker exec -i <postgres_container> psql -U $PGUSER -d $PGDATABASE < migrations/001_add_professor_columns.sql
```

or using the `psql` CLI:

```sh
psql -h localhost -U postgres -d student_check_monday_afternoon -f backend/migrations/001_add_professor_columns.sql
```

The migration above creates the new `email`, `department`, `status`, and `created_at` columns on the `professors` table.

If you don't have a migration tool, run the statements manually in your database client.

## API endpoints (relevant)

- `GET /api/get-all-professors` – retrieve list of professors
- `POST /api/create-professor` – create new professor
- `PUT /api/update-professor/:id` – update professor
- `DELETE /api/delete-professor/:id` – delete professor

Make sure the database schema matches the expected shape (email, department) before using the updated frontend.
