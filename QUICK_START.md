# Quick Start Guide

Get your Excel SaaS platform running in 5 minutes!

## 🚀 Fastest Path to Running

### 1. Install Dependencies

```bash
cd excel-saas
npm install
```

### 2. Configure Your Excel Formulas

Open `lib/formula-engine.ts` and customize the `exampleWorkbookConfig`:

```typescript
export const exampleWorkbookConfig: WorkbookConfig = {
  name: 'My Calculator',
  description: 'Your description',
  rows: 20,
  cols: 10,
  cells: [
    // Add your cells here
    { address: 'A1', value: 'Input Label', isInput: false },
    { address: 'B1', value: 10, isInput: true },
    { address: 'B5', formula: '=B1*2', isInput: false },
  ],
};
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - Your app is running! 🎉

## 📝 What You See

- **Blue cells** = User can edit (input cells)
- **Gray cells** = Calculated automatically (formula cells)
- **Export button** = Download DXF file for AutoCAD

## 🔧 Customize AutoCAD Export

Edit `lib/dxf-generator.ts` to change what gets exported:

```typescript
static generate(params: DXFGenerationParams): string {
  const { values } = params;
  
  // Get your calculated values
  const myValue = values['B5'];
  
  // Generate your DXF design
  return this.generateYourDesign(myValue);
}
```

## 📦 Deploy to Production

### Option 1: Docker (Easiest)

```bash
# Create .env file
cp env.example .env
# Edit .env with your settings

# Deploy
docker-compose up -d
```

### Option 2: Linux Server

See `DEPLOYMENT_GUIDE.md` for complete instructions.

## 🎯 Next Steps

1. **Test your formulas**: Enter values and verify calculations
2. **Customize the UI**: Edit `app/page.tsx` for branding
3. **Add authentication**: Set up NextAuth.js (optional)
4. **Deploy**: Follow deployment guide for your Linux server

## 📚 Documentation

- `README.md` - Complete overview and features
- `EXCEL_CONVERSION_GUIDE.md` - Convert your Excel file step-by-step
- `DEPLOYMENT_GUIDE.md` - Production deployment instructions

## ❓ Common Questions

**Q: How do I add more input cells?**  
A: Add to the `cells` array in `formula-engine.ts` with `isInput: true`

**Q: Can I use complex Excel formulas?**  
A: Yes! HyperFormula supports most Excel functions (SUM, IF, VLOOKUP, etc.)

**Q: How are formulas protected?**  
A: Formulas only exist on the server. Users never see or download them.

**Q: Can users download the Excel file?**  
A: No! They only see the interface and can export to AutoCAD.

**Q: How do I change the design?**  
A: Edit `app/page.tsx` for UI and `components/spreadsheet-editor.tsx` for the spreadsheet.

## 🆘 Need Help?

Check the full documentation or review the example configuration in `lib/formula-engine.ts`.

---

**You're ready to protect your Excel IP and sell it as a service! 🎊**
