# Startup Database

## Overview
The Startup Database project is a web application designed to provide users with a directory of startups, utilizing data from Companies House. The application features a clean and minimalistic design, inspired by modern web applications like Airtable, focusing on usability and clarity.

## Features
- **Search Functionality**: Users can search for companies by name or keyword.
- **API Integration**: Fetches data from the Companies House API to display company information.
- **Responsive Design**: The application is designed to be fully responsive, ensuring a seamless experience on both desktop and mobile devices.

## Project Structure
```
startup-database
├── src
│   ├── css
│   │   └── styles.css        # Contains the CSS styles for the project
│   ├── js
│   │   ├── app.js            # Main JavaScript file for application functionality
│   │   └── api.js            # Manages API calls and data fetching
│   └── pages
│       ├── index.html        # Main HTML page of the application
│       ├── privacy-policy.html# Privacy policy page
│       └── terms-conditions.html # Terms and conditions page
├── assets
│   └── fonts
│       └── inter.woff2       # Web font used in the project
├── .gitignore                # Specifies files and directories to ignore by Git
└── README.md                 # Documentation for the project
```

## Getting Started
1. **Clone the Repository**: 
   ```bash
   git clone <repository-url>
   cd startup-database
   ```

2. **Open the Project**: Use your preferred code editor to open the project.

3. **Run the Application**: Open `src/pages/index.html` in your web browser to view the application.

## Future Improvements
- Enhance the search functionality with advanced filters.
- Implement user authentication for personalized experiences.
- Add more detailed company profiles with additional data points.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.