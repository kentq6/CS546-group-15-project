


// custom error classes for 'catch all' error handling within the express custom error handler


export class PermissionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PermissionError'
    }
}

export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError'
    }
}

export class DuplicateKeyError extends Error {
    constructor(message) {
        super(message)
        this.name = 'DuplicateKeyError'
    }
}

export class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError'
    }
}

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError'
    }
}