export class AppError extends Error {
    constructor(
        public code: string,
        message: string,
        public status: number = 500,
        public data?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string, data?: any) {
        super('VALIDATION_ERROR', message, 400, data);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string, data?: any) {
        super('DATABASE_ERROR', message, 500, data);
    }
} 