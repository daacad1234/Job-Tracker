# Job Vacancy Board & Applicant Tracking — Backend

Spring Boot 3 · Java 17 · Spring Data JPA · PostgreSQL · Spring Security (JWT)

## 1. Prerequisites
- Java 17+
- Maven 3.9+ (or use the included `mvnw` if you add one)
- PostgreSQL 14+ running locally

## 2. Create the database
```sql
CREATE DATABASE jobboard_db;
```

## 3. Configure `src/main/resources/application.properties`
Update if your local Postgres credentials differ from the defaults:
```
spring.datasource.username=postgres
spring.datasource.password=postgres
```
For anything beyond local dev, set `JWT_SECRET` as an environment variable instead
of relying on the default in the properties file:
```bash
export JWT_SECRET=$(openssl rand -base64 64)
```

## 4. Run
```bash
mvn spring-boot:run
```
The API starts on **http://localhost:8080**. `spring.jpa.hibernate.ddl-auto=update`
will auto-create all 6 tables on first run (users, companies, categories,
job_vacancies, applications, saved_jobs).

## 5. Testing with Postman
Import `jobboard.postman_collection.json` (in this folder). Suggested flow:

1. **Register an employer** → `POST /api/auth/register` with `"role": "EMPLOYER"`
2. **Register an applicant** → same endpoint with `"role": "APPLICANT"`
3. Copy the `token` from each register/login response into the collection's
   `{{employerToken}}` / `{{applicantToken}}` variables (or use the pre-configured
   Postman scripts, which auto-save them after each auth call)
4. As employer: create a **Company**, then a **Category** (admin-only — register
   a third user with `"role": "ADMIN"` for this one, or promote one manually in
   the DB), then a **Job**
5. As applicant: **GET /api/jobs** to browse, then **POST /api/applications** to apply
6. As employer: **GET /api/applications/job/{jobId}** to review, then
   **PUT /api/applications/{id}/status** to move it to SHORTLISTED/ACCEPTED/etc.

All of this data is now sitting in Postgres and ready for the React frontend to
render — same endpoints, same tokens.

## 6. Roles & security summary
- `APPLICANT` — browse jobs, apply, view/withdraw own applications, save jobs
- `EMPLOYER` — manage own company profile(s) and job postings, review applicants
  for their own jobs
- `ADMIN` — manage categories, and can act on any company/job/application as an
  override
- Passwords are BCrypt-hashed and never serialized in any response (`@JsonIgnore`)
- JWT is required (`Authorization: Bearer <token>`) for every non-`GET /api/jobs`,
  non-`GET /api/categories`, non-`GET /api/companies`, non-`/api/auth/**` endpoint
- Ownership is enforced in the service layer (e.g. an employer can't edit another
  employer's job) in addition to role checks via `@PreAuthorize`
