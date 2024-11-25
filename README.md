# Word Salad Sifter
A Chrome extension designed to enhance productivity by processing and organizing highlighted text with the help of AI. Word Salad Sifter seamlessly integrates into your browsing experience, offering easy analysis of job postings, which is written to a Google Doc.

<p align="center">
  <img width="460" height="300" src="https://unartful-labs.com/projects/word-salad-sifter/images/StorePage.png" alt="Word Salad Sifter Chrome Extension">
</p>

## Features
- **Text Highlight Processing**: Select and process highlighted text directly on a webpage
- **Intuitive Interface**: Simple and accessible design, making it easy for anyone to use
- **Content Analysis**: Extract important information from verbose or poorly written job descriptions
- **Google Docs Integration**: Automatically saves processed content to your Google Docs

## How It Works
1. Find an interesting job posting
2. Highlight the job description
3. Right-click and select 'Sift Some Word Salad'
4. Let AI analyze and extract the key information

The extension automatically identifies and organizes:
- Company name and job title
- Education and experience requirements
- Required software knowledge
- Main job themes and key requirements
- Soft skills needed
- Prioritized list of critical skills
- Tone and cultural indicators
- Unique position aspects
- Important keywords and phrases
- Application instructions
- Source URL

This organized information makes it easy to quickly tailor your resume and cover letter to each position, perfect for batch job searching and applications.

## Technologies Used
- **Frontend**: TypeScript, React
- **APIs**: Chrome Extensions API, Google Docs / Google Drive APIs, Anthropic API
- **Build Tools**: Webpack, Babel
- **Styling**: SCSS, Framer Motion
- **AI Integration**: Uses Anthropic's Claude 3.5 for text analysis
  
## Installation

### From the Chrome Web Store
*(Pending approval)*
- Visit the [Chrome Web Store listing](https://chromewebstore.google.com/detail/unartful-labs-word-salad/fhfndnjlnahfnnnocegccejjfpigiioo) and click "Add to Chrome"

## Important Notes
- **API Key Required**: You'll need a paid Anthropic API key (setup instructions included in the extension)
- **Cost Efficiency**: $5.00 of API credit allows analysis of approximately 415 job postings
- **Compatibility**: Currently not compatible with ICIMS websites/job postings (or job postings created with `<p>` or `<li>` fragments.
