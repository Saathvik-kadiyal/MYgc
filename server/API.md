# API Documentation

## Authentication

### Signup
- **POST** `/api/auth/signup/initiate`
  - Initiates the signup process
  - Body: `{ email: string, password: string, role: 'user' | 'company' }`
  - Response: `{ success: boolean, message: string }`

### Login
- **POST** `/api/auth/login`
  - Authenticates a user/company
  - Body: `{ email: string, password: string }`
  - Response: `{ success: boolean, token: string, user: object }`

### Logout
- **POST** `/api/auth/logout`
  - Logs out the current user
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, message: string }`

## Profile

### Get Profile
- **GET** `/api/profile`
  - Gets the current user's profile
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, profile: object }`

### Update Profile
- **PUT** `/api/profile`
  - Updates the current user's profile
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ username?: string, email?: string, bio?: string, ... }`
  - Response: `{ success: boolean, profile: object }`

### Upload Profile Picture
- **POST** `/api/profile/upload`
  - Uploads a profile picture
  - Headers: `Authorization: Bearer <token>`
  - Body: `FormData` with `image` field
  - Response: `{ success: boolean, url: string }`

## Jobs

### Get All Jobs
- **GET** `/api/jobs`
  - Gets all available jobs
  - Query: `?page=1&limit=10&search=keyword`
  - Response: `{ success: boolean, jobs: array, total: number }`

### Get Job by ID
- **GET** `/api/jobs/:jobId`
  - Gets a specific job
  - Response: `{ success: boolean, job: object }`

### Create Job
- **POST** `/api/jobs`
  - Creates a new job (company only)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ title: string, description: string, requirements: array, ... }`
  - Response: `{ success: boolean, job: object }`

### Apply to Job
- **POST** `/api/jobs/:jobId/apply`
  - Applies to a job (user only)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, application: object }`

## Connections

### Connect with User
- **POST** `/api/connections/connect`
  - Sends a connection request
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ targetId: string, message?: string }`
  - Response: `{ success: boolean, connection: object }`

### Accept Connection
- **PUT** `/api/connections/accept/:connectionId`
  - Accepts a connection request
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, connection: object }`

### Reject Connection
- **PUT** `/api/connections/reject/:connectionId`
  - Rejects a connection request
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, message: string }`

## Notifications

### Get Notifications
- **GET** `/api/notifications`
  - Gets all notifications
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, notifications: array }`

### Mark as Read
- **PUT** `/api/notifications/:id/read`
  - Marks a notification as read
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, notification: object }`

### Mark All as Read
- **PUT** `/api/notifications/read-all`
  - Marks all notifications as read
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, message: string }`

## Error Responses

All error responses follow this format:
```json
{
    "success": false,
    "message": "Error message",
    "errors": [
        {
            "field": "fieldName",
            "message": "Error message"
        }
    ]
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error 