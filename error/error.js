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