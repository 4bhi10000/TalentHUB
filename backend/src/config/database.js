/**
 * Database Configuration & Prisma Client Setup
 * Enforces SQLite foreign keys and provides a single shared client instance.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'test' ? [] : ['warn', 'error']
});

// Explicitly ensure SQLite foreign keys are enabled
async function connectDatabase() {
  try {
    await prisma.$queryRawUnsafe('PRAGMA foreign_keys = ON;');
    return prisma;
  } catch (error) {
    console.error('Failed to initialize database connection with foreign key enforcement:', error);
    throw error;
  }
}

module.exports = {
  prisma,
  connectDatabase
};
