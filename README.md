# CS546-group-15-project
# Test instructions
- run `npm install` to install packages
- run `npm run start` to start the server
## Adding a company
- in postman, `POST /company` to signup an Owner and create a company
## Using protected routes 
Since making requests with cookies for authorization is a pain, especially for our app with role authorization, faking authentication by hardcoding it before running the server is easier for development.

To pretend making a request from a specific user/account
- copy the string of a user's ObjectId in mongoDbCompass in the users collection
- go to `dummyAuthenticate` in `middleware/auth.js`
- paste into `dummyId` 
