# Database Specification Document
## Centralized Student Portfolio Management & Discovery Platform

---

### Executive Summary

This document presents the complete database specification for the **Centralized Student Portfolio Management & Discovery Platform**. It details the architectural blueprint, data dictionary, relational constraints, entity-relationship models, Prisma schema, and initial database state required for academic evaluations, system deployment, and administrative maintenance.

---

### 1. Database Architecture & Technical Overview

| Parameter | Specification |
| :--- | :--- |
| **Database Engine** | PostgreSQL 15+ (Relational Database Management System) |
| **Object-Relational Mapping (ORM)** | Prisma ORM (`@prisma/client` ^6.x) |
| **Database Instance / Name** | `student_portfolio` |
| **Default Host & Port** | `localhost:5432` |
| **Database Connection URI** | `postgresql://postgres:postgres@localhost:5432/student_portfolio` |
| **Primary Key Standard** | Universally Unique Identifier v4 (UUID strings, `@default(uuid())`) |
| **Time Standard** | UTC timestamps with microsecond resolution (`DateTime @default(now())`) |
| **Foreign Key Actions** | Cascading Deletions (`onDelete: Cascade`) for parent-child lifecycles; Nullification (`onDelete: SetNull`) for auditable reviewer references |

---

### 2. Entity-Relationship (ER) Architecture

```mermaid
erDiagram
    USER ||--o| STUDENT_PROFILE : "has profile"
    USER ||--o| STAFF_PROFILE : "has profile"
    USER ||--o{ PASSWORD_RESET_TOKEN : "owns"

    DEPARTMENT ||--o{ BATCH : "offers"
    DEPARTMENT ||--o{ STUDENT_PROFILE : "enrolls"
    DEPARTMENT ||--o{ STAFF_PROFILE : "employs"

    BATCH ||--o{ STUDENT_PROFILE : "contains"
    BATCH ||--o{ STAFF_PROFILE : "assigned"

    STUDENT_PROFILE ||--o{ STUDENT_LINK : "publishes links"
    STUDENT_PROFILE ||--o{ STUDENT_SKILL : "possesses"
    STUDENT_PROFILE ||--o{ EDUCATION : "academic milestones"
    STUDENT_PROFILE ||--o{ PROJECT : "develops"
    STUDENT_PROFILE ||--o{ CERTIFICATION : "earns"
    STUDENT_PROFILE ||--o{ EXPERIENCE : "undertakes"
    STUDENT_PROFILE ||--o{ ACHIEVEMENT : "receives"
    STUDENT_PROFILE ||--o{ EXTRACURRICULAR : "participates"
    STUDENT_PROFILE ||--o{ STAFF_STUDENT_ASSIGNMENT : "mentored by"
    STUDENT_PROFILE ||--o{ DOCUMENT_SUBMISSION : "submits"
    STUDENT_PROFILE ||--o{ VERIFICATION_RECORD : "evaluated in"

    STAFF_PROFILE ||--o{ STAFF_STUDENT_ASSIGNMENT : "supervises"
    STAFF_PROFILE ||--o{ VERIFICATION_RECORD : "audits & reviews"

    SKILL ||--o{ STUDENT_SKILL : "cataloged in"
    SKILL ||--o{ PROJECT_TECHNOLOGY : "applied in"
    PROJECT ||--o{ PROJECT_TECHNOLOGY : "requires"

    DOCUMENT_SUBMISSION ||--o{ VERIFICATION_RECORD : "generates audit trail"
```

---

### 3. Enumeration Types (Custom Enums)

The system utilizes strict PostgreSQL `ENUM` types to guarantee data integrity across business logic:

#### 3.1. `Role`
Defines access tiers and permission boundaries in RBAC middleware.
* `STUDENT`: End-user student managing their personal profile, portfolio, and document evidence.
* `STAFF`: Faculty tutor / class in-charge responsible for student verification queues.
* `ADMIN`: System administrator overseeing department structure, account provisioning, and audit logs.

#### 3.2. `StudentStatus`
Tracks the student academic and lifecycle journey.
* `PENDING`: Newly created profile pending initial setup.
* `ACTIVE`: Currently enrolled and active student.
* `GRADUATED`: Finished graduation requirements.
* `ALUMNI`: Registered institutional alumnus.
* `SUSPENDED`: Disciplinary or administrative freeze.
* `ARCHIVED`: Archived record removed from active directory queries.

#### 3.3. `SkillCategory`
Categorizes skills for structured resume and portfolio presentation.
* `TECHNICAL`: Hard technical skills (e.g., React, PostgreSQL, Docker).
* `SOFT`: Interpersonal and leadership abilities (e.g., Problem Solving, Team Mentorship).
* `INTEREST`: Areas of domain focus (e.g., Cloud Architecture, Machine Learning).

#### 3.4. `EducationLevel`
Levels of formal education hierarchy.
* `SCHOOL`: Secondary / Senior Secondary Education (10th / 12th).
* `DIPLOMA`: Polytechnic or Vocational Diploma.
* `UG`: Undergraduate degree (BCA, B.Sc, B.Tech, etc.).
* `PG`: Postgraduate degree (MCA, M.Tech, M.Sc, etc.).
* `OTHER`: Certifications or non-degree programs.

#### 3.5. `ProjectProgress`
Represents development maturity of student project artifacts.
* `COMPLETED`: Fully functional and finished project.
* `IN_PROGRESS`: Currently under active development.
* `PROTOTYPE`: Proof of concept or research prototype.

#### 3.6. `VerificationStatus`
Lifecycle state for document proofs and milestone verification.
* `PENDING`: Awaiting staff review.
* `VERIFIED`: Approved and officially stamped by assigned tutor.
* `REJECTED`: Rejected by tutor with feedback.
* `RESUBMISSION_REQUIRED`: Returned to student for corrective uploads.

#### 3.7. `DocumentCategory`
Classification of evidentiary files.
* `CERTIFICATE`: Professional certifications and course completions.
* `ACHIEVEMENT`: Award proofs, competition prizes, and hackathon medals.
* `INTERNSHIP_EXPERIENCE`: Offer letters, completion letters, and stipend slips.
* `ACADEMIC_SUPPORTING`: Grade sheets, transcripts, or academic recommendation letters.
* `OTHER`: Miscellaneous supporting documents.

---

### 4. Data Dictionary & Detailed Table Schemas

#### 4.1. Authentication & Institutional Structure

##### Table: `User`
*Represents the central identity account across all roles.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Unique user identity identifier. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Institutional login email address. |
| `passwordHash` | `VARCHAR(255)` | `NOT NULL` | Bcrypt hashed string. |
| `role` | `Role` (Enum) | `NOT NULL`, Default: `STUDENT` | System role for RBAC. |
| `isInitialPassword`| `BOOLEAN` | `NOT NULL`, Default: `true` | Requires password change on initial login. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Record creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` (Auto-updated) | Last profile update timestamp. |

##### Table: `Department`
*Academic departments within the college.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Unique department identifier. |
| `name` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Full department name. |
| `code` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Short departmental acronym (e.g., `MCA`). |
| `description` | `TEXT` | Nullable | Detailed departmental mandate and scope. |
| `isArchived` | `BOOLEAN` | `NOT NULL`, Default: `false` | Soft-deletion indicator. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` | Update timestamp. |

##### Table: `Batch`
*Graduating classes / academic cohorts tied to departments.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Unique batch identifier. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Cohort label (e.g., `2024 - 2026`). |
| `graduationYear`| `INTEGER` | `NOT NULL` | Final graduation year (e.g., `2026`). |
| `departmentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `Department(id)` | Cascades on department deletion. |
| `isArchived` | `BOOLEAN` | `NOT NULL`, Default: `false` | Soft-deletion indicator. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` | Update timestamp. |

* **Constraints:** `@@unique([name, departmentId])` ensures no duplicate batches exist within a single department.

---

#### 4.2. Student Profiles & Portfolio Components

##### Table: `StudentProfile`
*Primary student portfolio identity, public presentation settings, and demographics.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Unique student profile identifier. |
| `userId` | `VARCHAR(36)` | `UNIQUE`, `NOT NULL`, FK -> `User(id)` | Cascade delete on User removal. |
| `fullName` | `VARCHAR(255)` | `NOT NULL` | Student official full name. |
| `slug` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | URL-friendly slug (`/portfolio/keerthana-ar`). |
| `rollNumber` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | University/College roll number. |
| `departmentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `Department(id)` | Assigned academic department. |
| `batchId` | `VARCHAR(36)` | `NOT NULL`, FK -> `Batch(id)` | Assigned batch cohort. |
| `photoUrl` | `VARCHAR(500)` | Nullable | Uploaded profile headshot URL. |
| `bio` | `VARCHAR(150)` | Nullable | Short professional elevator pitch. |
| `dateOfBirth` | `TIMESTAMP(3)`| Nullable | Date of birth. |
| `status` | `StudentStatus` | `NOT NULL`, Default: `ACTIVE` | Current enrollment status. |
| `isApproved` | `BOOLEAN` | `NOT NULL`, Default: `true` | Moderator clearance flag. |
| `isPublished` | `BOOLEAN` | `NOT NULL`, Default: `true` | Public portal discovery visibility. |
| `visibilitySettings`| `JSONB` | Nullable | JSON toggle map for individual portfolio sections. |
| `profileViews` | `INTEGER` | `NOT NULL`, Default: `0` | Analytical counter of public views. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Record creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` | Record modification timestamp. |

* **Indexes:** `[slug]`, `[departmentId]`, `[batchId]`, `[status]`.

##### Table: `StudentLink`
*External online profiles and contact channels.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `studentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `StudentProfile(id)` | Cascade delete. |
| `platform` | `VARCHAR(50)` | `NOT NULL` | Platform key (e.g., `github`, `linkedin`). |
| `url` | `VARCHAR(500)` | `NOT NULL` | Target link URL. |
| `label` | `VARCHAR(100)` | Nullable | Custom title. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |

##### Table: `Skill`
*Central repository of recognized skills and competencies.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `name` | `VARCHAR(100)` | `UNIQUE`, `NOT NULL` | Skill title (e.g., `Node.js`, `Python`). |
| `category` | `SkillCategory`| `NOT NULL`, Default: `TECHNICAL` | Category classification. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |

* **Indexes:** `[name]`.

##### Table: `StudentSkill`
*Many-to-Many junction table connecting students to skills.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `studentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `StudentProfile(id)` | Cascade delete. |
| `skillId` | `VARCHAR(36)` | `NOT NULL`, FK -> `Skill(id)` | Cascade delete. |
| `proficiency` | `VARCHAR(50)` | Nullable | Skill rating (`Beginner`, `Expert`). |

* **Constraints:** `@@unique([studentId, skillId])`.
* **Indexes:** `[studentId]`, `[skillId]`.

##### Table: `Education`
*Academic progression records.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `studentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `StudentProfile(id)` | Cascade delete. |
| `level` | `EducationLevel`| `NOT NULL`, Default: `UG` | Degree tier. |
| `program` | `VARCHAR(255)` | `NOT NULL` | Degree name (e.g., `MCA`). |
| `institution` | `VARCHAR(255)` | `NOT NULL` | College/University name. |
| `fieldOfStudy` | `VARCHAR(255)` | `NOT NULL` | Major/Branch. |
| `startYear` | `INTEGER` | `NOT NULL` | Starting year. |
| `endYear` | `INTEGER` | Nullable | Graduating year. |
| `isCurrent` | `BOOLEAN` | `NOT NULL`, Default: `false` | Enrollment status indicator. |
| `grade` | `VARCHAR(50)` | Nullable | Grade/CGPA score. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` | Update timestamp. |

* **Indexes:** `[studentId]`.

##### Table: `Project`
*Showcased technical projects, prototypes, and applications.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `studentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `StudentProfile(id)` | Cascade delete. |
| `title` | `VARCHAR(255)` | `NOT NULL` | Project headline. |
| `summary` | `VARCHAR(255)` | Nullable | One-line summary. |
| `description` | `TEXT` | `NOT NULL` | In-depth architectural/functional description. |
| `category` | `VARCHAR(100)` | Nullable | Domain tags (e.g., `Fullstack`, `Web3`). |
| `role` | `VARCHAR(100)` | Nullable | Student's role in execution. |
| `startDate` | `TIMESTAMP(3)`| Nullable | Project start date. |
| `endDate` | `TIMESTAMP(3)`| Nullable | Project finish date. |
| `isOngoing` | `BOOLEAN` | `NOT NULL`, Default: `false` | Active state indicator. |
| `githubUrl` | `VARCHAR(500)` | Nullable | Source code repository URL. |
| `demoLink` | `VARCHAR(500)` | Nullable | Live deployment URL. |
| `screenshotUrl` | `VARCHAR(500)` | Nullable | Representative banner image. |
| `isFeatured` | `BOOLEAN` | `NOT NULL`, Default: `false` | Featured on hero banner. |
| `progressStatus`| `ProjectProgress`| `NOT NULL`, Default: `COMPLETED` | Milestone state. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` | Update timestamp. |

* **Indexes:** `[studentId]`, `[isFeatured]`.

##### Table: `ProjectTechnology`
*Junction table binding projects to utilized technologies.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `projectId` | `VARCHAR(36)` | `NOT NULL`, FK -> `Project(id)` | Cascade delete. |
| `skillId` | `VARCHAR(36)` | `NOT NULL`, FK -> `Skill(id)` | Cascade delete. |

* **Constraints:** `@@unique([projectId, skillId])`.
* **Indexes:** `[projectId]`, `[skillId]`.

##### Table: `Certification`
*Certifications with built-in verification state.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `studentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `StudentProfile(id)` | Cascade delete. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Certificate title. |
| `issuer` | `VARCHAR(255)` | `NOT NULL` | Issuing organization (e.g., AWS, Coursera). |
| `issueDate` | `TIMESTAMP(3)`| `NOT NULL` | Issue timestamp. |
| `expiryDate` | `TIMESTAMP(3)`| Nullable | Validity expiration date. |
| `credentialUrl`| `VARCHAR(500)` | Nullable | External verification URL. |
| `certificateFileUrl`| `VARCHAR(500)`| Nullable | Uploaded PDF or certificate image. |
| `verificationStatus`| `VerificationStatus`| Default: `PENDING` | Current verification review state. |
| `verificationNotes` | `TEXT` | Nullable | Feedback provided by staff. |
| `verifiedAt` | `TIMESTAMP(3)`| Nullable | Timestamp of verification. |
| `verifiedBy` | `VARCHAR(255)` | Nullable | Reviewer name/email. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` | Update timestamp. |

* **Indexes:** `[studentId]`, `[verificationStatus]`.

##### Table: `Experience`
*Work experience, internships, and industrial training.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `studentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `StudentProfile(id)` | Cascade delete. |
| `organization` | `VARCHAR(255)` | `NOT NULL` | Company / Employer name. |
| `role` | `VARCHAR(255)` | `NOT NULL` | Designation or title. |
| `location` | `VARCHAR(255)` | Nullable | Location / Remote status. |
| `startDate` | `TIMESTAMP(3)`| `NOT NULL` | Start date. |
| `endDate` | `TIMESTAMP(3)`| Nullable | End date. |
| `isCurrent` | `BOOLEAN` | `NOT NULL`, Default: `false` | Active employment indicator. |
| `description` | `TEXT` | `NOT NULL` | Core duties and contributions. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` | Update timestamp. |

* **Indexes:** `[studentId]`.

##### Table: `Achievement`
*Honors, awards, scholarships, and competition wins.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `studentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `StudentProfile(id)` | Cascade delete. |
| `title` | `VARCHAR(255)` | `NOT NULL` | Award / Milestone name. |
| `description` | `TEXT` | `NOT NULL` | Description of accomplishment. |
| `date` | `TIMESTAMP(3)`| `NOT NULL` | Date achieved. |
| `proofUrl` | `VARCHAR(500)` | Nullable | Online proof/link. |
| `proofFileUrl` | `VARCHAR(500)` | Nullable | Uploaded proof file. |
| `verificationStatus`| `VerificationStatus`| Default: `PENDING` | Verification status. |
| `verifiedAt` | `TIMESTAMP(3)`| Nullable | Date verified. |
| `verifiedBy` | `VARCHAR(255)` | Nullable | Verifier identifier. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` | Update timestamp. |

* **Indexes:** `[studentId]`, `[verificationStatus]`.

##### Table: `Extracurricular`
*Voluntary clubs, student bodies, sports, and societal initiatives.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `studentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `StudentProfile(id)` | Cascade delete. |
| `activityName` | `VARCHAR(255)` | `NOT NULL` | Name of event/activity. |
| `role` | `VARCHAR(255)` | `NOT NULL` | Leadership or participation role. |
| `organization` | `VARCHAR(255)` | Nullable | Organizing body or club. |
| `duration` | `VARCHAR(100)` | `NOT NULL` | Duration timeframe. |
| `description` | `TEXT` | `NOT NULL` | Description of involvement. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` | Update timestamp. |

* **Indexes:** `[studentId]`.

---

#### 4.3. Staff Profiles, Tutoring & Verification Workflow

##### Table: `StaffProfile`
*Faculty mentors, class in-charges, and departmental tutors.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `userId` | `VARCHAR(36)` | `UNIQUE`, `NOT NULL`, FK -> `User(id)` | Cascade delete. |
| `staffId` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Faculty ID (e.g., `STF-MCA-001`). |
| `fullName` | `VARCHAR(255)` | `NOT NULL` | Professor display name. |
| `phone` | `VARCHAR(50)` | Nullable | Contact phone number. |
| `designation` | `VARCHAR(100)` | Default: `"Class In-charge / Tutor"` | Official title. |
| `departmentId` | `VARCHAR(36)` | Nullable, FK -> `Department(id)` | Associated department. |
| `batchId` | `VARCHAR(36)` | Nullable, FK -> `Batch(id)` | Assigned class cohort. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` | Update timestamp. |

* **Indexes:** `[departmentId]`, `[batchId]`.

##### Table: `StaffStudentAssignment`
*Direct mentor-mentee mapping enabling distributed verification queues.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `staffProfileId`| `VARCHAR(36)`| `NOT NULL`, FK -> `StaffProfile(id)`| Cascade delete. |
| `studentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `StudentProfile(id)`| Cascade delete. |
| `assignedAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Assignment timestamp. |

* **Constraints:** `@@unique([staffProfileId, studentId])`.
* **Indexes:** `[staffProfileId]`, `[studentId]`.

##### Table: `DocumentSubmission`
*Uploaded student proof documents queued for faculty verification.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `studentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `StudentProfile(id)`| Cascade delete. |
| `title` | `VARCHAR(255)` | `NOT NULL` | Document title. |
| `category` | `DocumentCategory`| Default: `CERTIFICATE` | Category of document. |
| `fileUrl` | `VARCHAR(500)` | `NOT NULL` | Relative path to local upload storage. |
| `fileName` | `VARCHAR(255)` | Nullable | Original uploaded file name. |
| `fileSize` | `INTEGER` | Nullable | File byte size. |
| `description` | `TEXT` | Nullable | Additional explanatory context. |
| `credentialUrl`| `VARCHAR(500)` | Nullable | External credential check link. |
| `issueDate` | `TIMESTAMP(3)`| Nullable | Date of issuance. |
| `status` | `VerificationStatus`| Default: `PENDING` | Active review state. |
| `version` | `INTEGER` | `NOT NULL`, Default: `1` | Resubmission revision count. |
| `certificationId`| `VARCHAR(36)`| Nullable | Optional link to Certification record. |
| `achievementId` | `VARCHAR(36)`| Nullable | Optional link to Achievement record. |
| `experienceId` | `VARCHAR(36)`| Nullable | Optional link to Experience record. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Creation timestamp. |
| `updatedAt` | `TIMESTAMP(3)`| `NOT NULL` | Update timestamp. |

* **Indexes:** `[studentId]`, `[category]`, `[status]`.

##### Table: `VerificationRecord`
*Auditable, immutable record of tutor review decisions.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `documentSubmissionId`| `VARCHAR(36)`| Nullable, FK -> `DocumentSubmission(id)`| Cascade delete. |
| `certificationId`| `VARCHAR(36)`| Nullable | Certification ID context. |
| `achievementId` | `VARCHAR(36)`| Nullable | Achievement ID context. |
| `studentId` | `VARCHAR(36)` | `NOT NULL`, FK -> `StudentProfile(id)`| Cascade delete. |
| `reviewerStaffId`| `VARCHAR(36)`| Nullable, FK -> `StaffProfile(id)`| Set Null on tutor deletion. |
| `reviewerName` | `VARCHAR(255)` | `NOT NULL` | Cached name of tutor. |
| `reviewerEmail`| `VARCHAR(255)` | `NOT NULL` | Cached email of tutor. |
| `reviewerRole` | `VARCHAR(50)` | Default: `"STAFF"` | Verifier role. |
| `decision` | `VerificationStatus`| `NOT NULL` | Decision rendered (`VERIFIED`, etc.). |
| `comments` | `TEXT` | Nullable | Mandatory feedback for rejections/resubmissions. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Decision timestamp. |

* **Indexes:** `[documentSubmissionId]`, `[studentId]`, `[reviewerStaffId]`, `[decision]`, `[createdAt]`.

---

#### 4.4. Security, Access Controls & System Auditing

##### Table: `AuditLog`
*Centralized security audit log of all administrative actions.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `adminId` | `VARCHAR(36)` | `NOT NULL` | Acting administrator ID. |
| `adminEmail` | `VARCHAR(255)` | `NOT NULL` | Acting administrator email. |
| `action` | `VARCHAR(100)` | `NOT NULL` | Event code (e.g., `PASSWORD_RESET`, `BATCH_CREATE`). |
| `targetType` | `VARCHAR(100)` | `NOT NULL` | Entity type affected (`User`, `Department`). |
| `targetId` | `VARCHAR(100)` | `NOT NULL` | Identifier of modified target. |
| `details` | `TEXT` | Nullable | Serialized contextual parameters. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Action execution timestamp. |

* **Indexes:** `[adminId]`, `[action]`, `[createdAt]`.

##### Table: `PasswordResetToken`
*Expiring security tokens for self-service or admin-initiated password resets.*

| Column Name | SQL Data Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK, `@default(uuid())` | Identifier. |
| `userId` | `VARCHAR(36)` | `NOT NULL`, FK -> `User(id)` | Cascade delete. |
| `tokenHash` | `VARCHAR(255)` | `NOT NULL` | Secure SHA-256 token hash. |
| `expiresAt` | `TIMESTAMP(3)`| `NOT NULL` | Expiration deadline. |
| `used` | `BOOLEAN` | `NOT NULL`, Default: `false` | Single-use invalidation flag. |
| `createdAt` | `TIMESTAMP(3)`| Default: `CURRENT_TIMESTAMP` | Generation timestamp. |

* **Indexes:** `[userId]`.

---

### 5. Standard Seed Profiles & Initial Accounts

Upon executing `node prisma/seed.js`, the platform is seeded with baseline data for demonstration and testing:

| Role | Name | Email | Password | Primary Assignment / Details |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Institutional Admin | `admin@college.edu` | `AdminPassword@123` | System-wide administrative controls |
| **STAFF** | Prof. Rajesh Kumar | `staff.mca@college.edu` | `StaffPassword@123` | Department: MCA, Batch: 2024–2026 |
| **STAFF** | Dr. Meenakshi Sundaram | `staff.cse@college.edu` | `StaffPassword@123` | Department: CSE, Batch: 2022–2026 |
| **STUDENT** | Keerthana A R | `keerthana.ar@college.edu` | `Student@123` | Roll: `MCA202401`, Slug: `keerthana-ar` |
| **STUDENT** | Arun Kumar | `arun.kumar@college.edu` | `Student@123` | Roll: `CSE202245`, Slug: `arun-kumar` |

* **Default Departments:** MCA (`MCA`), CSE (`CSE`), IT (`IT`), ECE (`ECE`).
* **Batches:** 2024–2026, 2023–2025, 2022–2026, 2020–2024.
* **Master Skills Catalog:** 19 Technical skills (React, Node.js, PostgreSQL, Docker, AWS, etc.), 6 Soft skills (Leadership, Agile Collaboration), and 7 Interest domains.

---

### 6. Database Maintenance & Operations Manual

#### 6.1. Environment Configuration
The database connection string is configured in `server/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/student_portfolio"
```

#### 6.2. Operational Commands
Execute within the `server/` directory:

```bash
# 1. Synchronize schema changes directly to PostgreSQL
npx prisma db push

# 2. Re-generate Prisma Client bindings after schema edits
npx prisma generate

# 3. Clean database and run comprehensive seed script
node prisma/seed.js

# 4. Open Prisma Studio (GUI database visualizer) on http://localhost:5555
npx prisma studio
```
