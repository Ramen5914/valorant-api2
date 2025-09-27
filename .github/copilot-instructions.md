# Valorant API v2 - AI Coding Assistant Instructions

This is a NestJS application that processes Valorant competitive match data using a queue-based architecture with PostgreSQL and Redis.

## Architecture Overview

### Core Service Boundaries
- **Competitive Service** (`src/competitive/`): Processes match data and manages competitive match entities
- **Player Service** (`src/player/`): Manages player profiles and data
- **Queue Service** (`src/queue/`): Handles async match processing via Bull queues
- **External Service** (`src/external/`): Manages third-party API integrations (Henrik API)

### Data Flow Pattern
1. Players are added via REST endpoints or queue service
2. Queue processor fetches match history from Henrik API
3. Each match is validated against Zod schemas (`competitive.schema.ts`)
4. Match data is transformed and stored in PostgreSQL via TypeORM entities
5. Player profiles are extracted from matches and saved to database

## Key Development Patterns

### Entity Relationships
```typescript
// Follow this relationship pattern in src/competitive/entities/
CompetitiveMatch (1) -> (many) Team
CompetitiveMatch (1) -> (many) CompetitivePlayer
CompetitivePlayer (many) -> (1) Player
```

### Zod Schema Validation
- All external API data MUST be validated with Zod schemas before database storage
- See `src/competitive/competitive.schema.ts` for the comprehensive match schema
- Henrik API returns Riot Games format - use schemas to ensure data integrity

### Queue Processing
- Use Bull queues for all async operations (`@nestjs/bull`)
- Configure jobs with retry logic: `attempts: 3, backoff: 'exponential'`
- Add rate limiting delays between API calls (`await this.delay(500)`)
- Process jobs in `player-match.processor.ts` following the established pattern

## Environment & Infrastructure

### Required Services
```bash
# Start dependencies first
docker compose up postgres redis

# Development
npm run start:dev

# Production
npm run start:prod
```

### Environment Variables
- `HENRIK_API_KEY`: Required for Valorant API access
- `DB_*`: PostgreSQL connection (defaults in `app.module.ts`)
- `REDIS_*`: Redis connection for Bull queues
- `PORT`: Server port (defaults to 4000)

### Database Configuration
- Uses TypeORM with auto-sync in development (`synchronize: true`)
- Entities auto-discovered via glob pattern in `app.module.ts`
- PostgreSQL with UUID primary keys for matches/players

## Testing Conventions

### Unit Tests
- Use Jest with `ts-jest` transformer
- Test utilities in `src/functions/` (see `time.spec.ts`)
- Focus on business logic, data transformations, and edge cases

### E2E Tests
- Use `@nestjs/testing` with `supertest`
- Test complete workflows (player addition → queue processing → data storage)
- Mock external APIs (Henrik API) in test environment

## API Integration Patterns

### Henrik API Usage
- Use POST requests to `/valorant/v1/raw` endpoint for bulk data
- Implement exponential backoff for rate limiting
- Always validate responses before processing
- Cache player profiles to avoid redundant API calls

### Error Handling
- Log all external API failures with context
- Continue processing other items when one fails
- Use try/catch blocks around individual operations in loops
- Return meaningful error responses to clients

## Development Workflow

### Adding New Features
1. Create/update TypeORM entities in appropriate module
2. Add Zod validation schemas for external data
3. Implement service logic following dependency injection pattern
4. Add queue processing if async operations needed
5. Write unit tests covering edge cases and error scenarios

### Module Structure
```
src/module/
├── module.controller.ts    # REST endpoints
├── module.service.ts       # Business logic
├── module.module.ts        # NestJS module definition
├── module.schema.ts        # Zod validation (if needed)
└── entities/              # TypeORM entities
    └── *.entity.ts
```