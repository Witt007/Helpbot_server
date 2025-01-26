"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(code, message, status = 500, data) {
        super(message);
        this.code = code;
        this.status = status;
        this.data = data;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, data) {
        super('VALIDATION_ERROR', message, 400, data);
    }
}
exports.ValidationError = ValidationError;
class DatabaseError extends AppError {
    constructor(message, data) {
        super('DATABASE_ERROR', message, 500, data);
    }
}
exports.DatabaseError = DatabaseError;
