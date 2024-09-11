// logger.js
import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

function formatLog(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}\n`;
}

function appendToLog(fileName, logEntry) {
    const filePath = path.join(logDir, fileName);
    fs.appendFile(filePath, logEntry, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
}

export const logger = {
    info: (message) => {
        const logEntry = formatLog('info', message);
        console.log(logEntry);
        appendToLog('app.log', logEntry);
    },
    error: (message) => {
        const logEntry = formatLog('error', message);
        console.error(logEntry);
        appendToLog('error.log', logEntry);
    },
    warn: (message) => {
        const logEntry = formatLog('warn', message);
        console.warn(logEntry);
        appendToLog('app.log', logEntry);
    }
};
