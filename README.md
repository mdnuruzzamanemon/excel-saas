# Excel SaaS Platform 🔒

A secure web-based SaaS platform that protects your Excel formulas while allowing users to input values, see calculations, and export to AutoCAD. Perfect for selling calculation services without exposing your intellectual property.

## 🎯 Key Features

- **🔐 Formula Protection**: Your Excel formulas stay secure on the server - users can never see or download them
- **📊 Excel-like Interface**: Familiar spreadsheet UI for easy data entry
- **⚡ Real-time Calculation**: Instant calculations using HyperFormula engine
- **🎨 AutoCAD Export**: One-click DXF file generation for AutoCAD integration
- **🚀 Modern Tech Stack**: Built with Next.js 14, TypeScript, and TailwindCSS
- **🐳 Docker Ready**: Easy deployment on Linux servers

## 🏗️ Architecture

### How It Works

1. **Your Excel File** → Convert formulas to server-side configuration
2. **User Input** → Users edit values in a web interface (blue cells)
3. **Server Calculation** → Formulas execute securely on the server
4. **Results Display** → Calculated values shown in real-time (gray cells)
5. **AutoCAD Export** → Generate DXF files based on calculations

### Security Model

- ✅ Formulas stored only on server
- ✅ API endpoints process calculations
- ✅ Users see only input/output values
- ✅ No formula exposure in client code
- ✅ No download of Excel file

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
cd excel-saas
npm install
```

2. **Set up environment variables**:
```bash
# Copy the example file
cp env.example .env

# Edit .env with your configuration
DATABASE_URL="postgresql://user:password@localhost:5432/excel_saas"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

3. **Set up the database**:
```bash
npx prisma generate
npx prisma db push
```

4. **Configure your Excel formulas**:
Edit `lib/formula-engine.ts` and update `exampleWorkbookConfig` with your Excel structure:

```typescript
export const exampleWorkbookConfig: WorkbookConfig = {
  name: 'Your Calculator Name',
  description: 'Description',
  rows: 20,
  cols: 10,
  cells: [
    // Input cells (editable by users)
    { address: 'A1', value: 'Length', isInput: false },
    { address: 'B1', value: 10, isInput: true },
    
    // Formula cells (calculated on server)
    { address: 'A5', value: 'Area', isInput: false },
    { address: 'B5', formula: '=B1*B2', isInput: false },
  ],
};
```

5. **Customize AutoCAD export**:
Edit `lib/dxf-generator.ts` to generate your specific AutoCAD design based on calculated values.

6. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📦 Deployment on Linux Server

### Option 1: Docker Deployment (Recommended)

1. **Build the Docker image**:
```bash
docker build -t excel-saas .
```

2. **Run with Docker Compose**:
```bash
docker-compose up -d
```

### Option 2: Direct Deployment

1. **Build the application**:
```bash
npm run build
```

2. **Start with PM2**:
```bash
npm install -g pm2
pm2 start npm --name "excel-saas" -- start
pm2 save
pm2 startup
```

3. **Set up Nginx reverse proxy**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Customization Guide

### 1. Converting Your Excel File

To convert your existing Excel file:

1. **Identify input cells**: Which cells should users edit?
2. **Extract formulas**: Document all formula cells
3. **Map to configuration**: Create cell definitions in `formula-engine.ts`

Example mapping:
- Excel cell `B1` with value `10` → `{ address: 'B1', value: 10, isInput: true }`
- Excel cell `B5` with formula `=B1*B2` → `{ address: 'B5', formula: '=B1*B2', isInput: false }`

### 2. Customizing AutoCAD Output

Edit `lib/dxf-generator.ts` to create your specific design:

```typescript
static generate(params: DXFGenerationParams): string {
  const { values } = params;
  
  // Extract your calculated values
  const length = values['B1'];
  const width = values['B2'];
  
  // Generate DXF content based on your design
  return this.generateYourDesign(length, width);
}
```

### 3. Adding Authentication

The project includes NextAuth.js setup. To enable:

1. Uncomment auth configuration in `app/api/auth/[...nextauth]/route.ts`
2. Add provider credentials to `.env`
3. Protect routes with middleware

## 📚 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **UI Components**: shadcn/ui, Lucide Icons
- **Formula Engine**: HyperFormula (Excel-compatible)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js (optional)
- **AutoCAD Export**: DXF format generation

## 🔒 Security Features

- Server-side formula execution
- No client-side formula exposure
- API rate limiting (recommended to add)
- User authentication (optional)
- Input validation
- SQL injection protection via Prisma

## 📝 Project Structure

```
excel-saas/
├── app/
│   ├── api/
│   │   ├── calculate/       # Calculation endpoint
│   │   └── export-dxf/      # AutoCAD export endpoint
│   └── page.tsx             # Main application page
├── components/
│   └── spreadsheet-editor.tsx  # Excel-like interface
├── lib/
│   ├── formula-engine.ts    # Formula processing (CUSTOMIZE THIS)
│   ├── dxf-generator.ts     # AutoCAD export (CUSTOMIZE THIS)
│   └── prisma.ts            # Database client
├── prisma/
│   └── schema.prisma        # Database schema
└── Dockerfile               # Docker configuration
```

## 🤝 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review example configurations
3. Test with the included example workbook

## 📄 License

This project is provided as-is for commercial use. Customize it for your specific Excel calculation needs.

## 🎓 Next Steps

1. ✅ Configure your Excel formulas in `formula-engine.ts`
2. ✅ Customize AutoCAD export in `dxf-generator.ts`
3. ✅ Test calculations with your data
4. ✅ Deploy to your Linux server
5. ✅ Set up domain and SSL certificate
6. ✅ Add authentication if needed
7. ✅ Configure payment integration (Stripe, etc.)

---

**Built with ❤️ for protecting your Excel IP while delivering SaaS value**
