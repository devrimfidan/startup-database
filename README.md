# Cambridge Startups Directory

## Overview
The Cambridge Startups Directory is a web application designed to provide users with a searchable directory of startups in the Cambridge area, utilizing data from Companies House. The application features a clean and minimalistic design, focusing on usability and clarity.

## Features
- **Search Functionality**: Users can search for companies by name or keyword
- **Filter System**: Filter results by company status and type
- **API Integration**: Fetches data from the Companies House API to display company information
- **Responsive Design**: Fully responsive interface for desktop and mobile devices
- **Startup Resources**: Curated collection of resources for entrepreneurs and startup founders

## Project Structure
```
startup-database
├── src
│   ├── assets
│   │   └── images
│   │       └── logo.png      # Site logo and other images
│   ├── css
│   │   └── style.css         # Main stylesheet for the project
│   ├── js
│   │   └── app.js            # Main JavaScript file for application functionality
│   └── pages
│       ├── index.html        # Main search page of the application
│       ├── resources.html    # Startup resources and links
│       ├── about.html        # About page with project information
│       ├── privacy-policy.html # Privacy policy page
│       └── terms-conditions.html # Terms and conditions page
├── .gitignore                # Specifies files and directories to ignore by Git
└── README.md                 # Documentation for the project
```

## Getting Started
1. **Clone the Repository**: 
   ```bash
   git clone https://github.com/devrimfidan/startup-database.git
   cd startup-database
   ```

2. **Open the Project**: Use your preferred code editor to open the project.

3. **Run the Application**: Open `src/pages/index.html` in your web browser to view the application.

## Using the Application
1. Enter a company name or keyword in the search box
2. Use filters to narrow down results by company status or type
3. Click on a company to see detailed information
4. Visit the Resources page for helpful links and tools for startups

## Future Improvements
- Enhanced search functionality with additional filters
- User accounts for saving favorite companies
- Integration with additional data sources
- Interactive dashboard with startup metrics and trends

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

## Acknowledgments
This website's design is a fork and adaptation of the "Norwegian municipality website concept" created by Håvard Brynjulfsen.