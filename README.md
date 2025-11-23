# Serverless Image Uploader

A serverless image upload and retrieval service built with AWS Lambda, S3, and DynamoDB using TypeScript.

## Features

- Upload images and receive a unique retrieval link
- Retrieve images using a unique identifier
- Delete images and associated metadata
- Rate limiting for API security
- Serverless architecture for scalability
- Infrastructure as Code using AWS SAM

## Architecture

- **AWS Lambda**: Serverless function with Function URL for HTTP access
- **Amazon S3**: Object storage for images
- **Amazon DynamoDB**: Metadata storage for image information
- **TypeScript**: Type-safe development

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- AWS Account
- Basic knowledge of AWS services

## Installation Guide

### 1. Install Node.js and npm

If you don't have Node.js installed:

**macOS (using Homebrew):**
```bash
brew install node
```

**Windows:**
Download from [nodejs.org](https://nodejs.org/)

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify installation:
```bash
node --version
npm --version
```

### 2. Install AWS CLI

**macOS:**
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

**Windows:**
Download and run the AWS CLI MSI installer from:
```
https://awscli.amazonaws.com/AWSCLIV2.msi
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

Verify installation:
```bash
aws --version
```

### 3. Configure AWS CLI

Configure your AWS credentials:

```bash
aws configure
```

You'll be prompted to enter:
- **AWS Access Key ID**: Your AWS access key
- **AWS Secret Access Key**: Your AWS secret key
- **Default region name**: e.g., `us-east-1`, `ap-south-1`
- **Default output format**: `json` (recommended)

To get your AWS credentials:
1. Log in to AWS Console
2. Go to IAM → Users → Your User → Security Credentials
3. Create Access Key if you don't have one

### 4. Install AWS SAM CLI

**macOS (using Homebrew):**
```bash
brew tap aws/tap
brew install aws-sam-cli
```

**Windows:**
Download and run the AWS SAM CLI MSI installer:
```
https://github.com/aws/aws-sam-cli/releases/latest/download/AWS_SAM_CLI_64_PY3.msi
```

**Linux:**
```bash
wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
sudo ./sam-installation/install
```

Verify installation:
```bash
sam --version
```

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/deepaksinghsolanki1989/Serverless-Image-Manager.git
cd Serverless-Image-Manager
```

### 2. Install Dependencies

```bash
npm install
```

## Local Development

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Build the Project

```bash
npm run build
```

### Run Locally with SAM

Start the local API Gateway and Lambda function:

```bash
npm start
```

The API will be available at `http://localhost:3000`
## Security Considerations

- Rate limiting is implemented to prevent abuse
- CORS is configured for web access
- Images are stored with unique identifiers
- Metadata is separated from image storage

## Performance

- Lambda cold start: ~1-2 seconds
- Average response time: <500ms
- Concurrent execution: Handled by AWS Lambda auto-scaling

## License

MIT License

## Support

For issues and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ using AWS SAM and TypeScript**