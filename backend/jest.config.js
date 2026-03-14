module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        // Não usar mais isolatedModules aqui, colocar no tsconfig.json
      }
    ],
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!(dayjs|zod|@prisma/client)/)'
  ],
};
