# Career Clarity AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

An intelligent career development platform that helps job seekers optimize their resumes, identify skill gaps, and improve their chances of landing their dream jobs using AI-powered analysis.

## ✨ Features

- **Resume Parsing**: Extract and analyze information from PDF, DOCX, and TXT resumes
- **Role Classification**: AI-powered role prediction based on resume content
- **Skill Gap Analysis**: Identify missing skills for target job roles
- **ATS Optimization**: Get your resume past Applicant Tracking Systems
- **Interactive Dashboard**: Beautiful, responsive UI built with React and shadcn/ui
- **RESTful API**: FastAPI backend with comprehensive documentation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/career-clarity-ai.git
   cd career-clarity-ai
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server** (from the backend directory)
   ```bash
   uvicorn main:app --reload
   ```

2. **Start the frontend development server** (from the frontend directory)
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

## 🛠️ Tech Stack

- **Frontend**: 
  - React 18 with TypeScript
  - Vite for build tooling
  - shadcn/ui for beautiful, accessible components
  - React Query for data fetching
  - Tailwind CSS for styling

- **Backend**:
  - FastAPI
  - PyMuPDF for PDF processing
  - python-docx for DOCX processing
  - Sentence Transformers for NLP tasks
  - scikit-learn for similarity calculations

## 📚 API Documentation

Once the backend server is running, visit `http://localhost:8000/docs` for interactive API documentation.

### Key Endpoints

- `POST /parse-resume`: Upload and parse a resume file
- `POST /classify-role`: Get role predictions for a resume
- `POST /analyze-skill-gap`: Analyze skill gaps for a target role
- `POST /ats-score`: Get ATS optimization suggestions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [FastAPI](https://fastapi.tiangolo.com/) for the amazing backend framework
- [Hugging Face](https://huggingface.co/) for the transformer models
- All contributors and open-source maintainers who made this project possible

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/09546b17-64bb-4c47-8f32-e1fcafa98365) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
