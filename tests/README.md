# Option 1: Run the bash script (recommended)
./tests/run-medusa-tests.sh

# Option 2: Run tests manually
cd tests
npm install
npm test

# Option 3: Run specific test files
cd tests
npm run test:medusa  # Just Medusa health tests
npx jest docker-health.test.js  # Just Docker tests