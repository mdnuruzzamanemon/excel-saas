# Excel to SaaS Conversion Guide

This guide explains how to convert your existing Excel file with formulas into the secure SaaS platform.

## Step 1: Analyze Your Excel File

### 1.1 Identify Cell Types

Open your Excel file and categorize each cell:

- **Input Cells**: Cells where users enter data (e.g., dimensions, quantities)
- **Formula Cells**: Cells with calculations (e.g., `=A1*B1`, `=SUM(A1:A10)`)
- **Label Cells**: Text labels describing what each value represents
- **Constant Cells**: Fixed values that never change

### 1.2 Document Your Structure

Create a spreadsheet mapping:

| Cell | Type | Content | Example |
|------|------|---------|---------|
| A1 | Label | "Length (m)" | - |
| B1 | Input | 10 | User enters |
| A2 | Label | "Width (m)" | - |
| B2 | Input | 5 | User enters |
| A5 | Label | "Area (m²)" | - |
| B5 | Formula | `=B1*B2` | Calculated |

## Step 2: Extract Formulas

### 2.1 List All Formulas

For each formula cell, document:
1. Cell address (e.g., B5)
2. The exact formula (e.g., `=B1*B2`)
3. What it calculates (e.g., "Area calculation")

### 2.2 Check Formula Compatibility

HyperFormula supports most Excel formulas. Verify your formulas are compatible:

**Supported:**
- Basic arithmetic: `+`, `-`, `*`, `/`, `^`
- Functions: `SUM`, `AVERAGE`, `IF`, `VLOOKUP`, `INDEX`, `MATCH`, etc.
- Cell references: `A1`, `$A$1`, `Sheet1!A1`
- Ranges: `A1:A10`, `B1:D5`

**May need adjustment:**
- VBA macros (not supported - need to rewrite logic)
- External data connections (need API integration)
- Complex array formulas (test individually)

## Step 3: Create Configuration

### 3.1 Open `lib/formula-engine.ts`

Find the `exampleWorkbookConfig` object.

### 3.2 Set Basic Info

```typescript
export const exampleWorkbookConfig: WorkbookConfig = {
  name: 'Your Calculator Name',
  description: 'Brief description of what it calculates',
  rows: 30,  // Total rows needed
  cols: 10,  // Total columns needed (A-J = 10)
  cells: [
    // Cell definitions go here
  ],
};
```

### 3.3 Add Cell Definitions

For each cell in your Excel:

**Label Cell (non-editable text):**
```typescript
{ 
  address: 'A1', 
  value: 'Length (m)', 
  isInput: false,
  label: 'Length Label'
}
```

**Input Cell (user can edit):**
```typescript
{ 
  address: 'B1', 
  value: 10,  // Default value
  isInput: true,
  label: 'Length Value'
}
```

**Formula Cell (calculated):**
```typescript
{ 
  address: 'B5', 
  formula: '=B1*B2',  // Your Excel formula
  isInput: false,
  label: 'Area Result'
}
```

### 3.4 Complete Example

```typescript
export const myWorkbookConfig: WorkbookConfig = {
  name: 'Structural Beam Calculator',
  description: 'Calculate beam dimensions and load capacity',
  rows: 20,
  cols: 8,
  cells: [
    // Section 1: Inputs
    { address: 'A1', value: 'Beam Length (m)', isInput: false },
    { address: 'B1', value: 10, isInput: true },
    
    { address: 'A2', value: 'Load (kN)', isInput: false },
    { address: 'B2', value: 50, isInput: true },
    
    { address: 'A3', value: 'Material Factor', isInput: false },
    { address: 'B3', value: 1.5, isInput: true },
    
    // Section 2: Calculations
    { address: 'A5', value: 'Total Load (kN)', isInput: false },
    { address: 'B5', formula: '=B2*B3', isInput: false },
    
    { address: 'A6', value: 'Load per meter (kN/m)', isInput: false },
    { address: 'B6', formula: '=B5/B1', isInput: false },
    
    { address: 'A7', value: 'Max Moment (kNm)', isInput: false },
    { address: 'B7', formula: '=(B5*B1)/8', isInput: false },
    
    // Section 3: Results
    { address: 'A10', value: 'Required Section Modulus', isInput: false },
    { address: 'B10', formula: '=B7/250', isInput: false },
  ],
};
```

## Step 4: Test Your Configuration

### 4.1 Update the Import

In `lib/formula-engine.ts`, export your configuration:

```typescript
// Replace exampleWorkbookConfig with your config
export const myWorkbookConfig: WorkbookConfig = { ... };
```

### 4.2 Update API Routes

In `app/api/calculate/route.ts`, change:

```typescript
// Old:
const config = exampleWorkbookConfig;

// New:
const config = myWorkbookConfig;
```

### 4.3 Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and:
1. Enter values in blue (input) cells
2. Verify calculations in gray (formula) cells
3. Check that results match your Excel file

## Step 5: Customize AutoCAD Export

### 5.1 Open `lib/dxf-generator.ts`

### 5.2 Map Calculated Values

Identify which calculated values you need for AutoCAD:

```typescript
static generate(params: DXFGenerationParams): string {
  const { values } = params;
  
  // Extract your specific values
  const beamLength = values['B1'] || 0;
  const totalLoad = values['B5'] || 0;
  const sectionModulus = values['B10'] || 0;
  
  // Generate DXF based on your design
  return this.generateBeamDesign(beamLength, totalLoad, sectionModulus);
}
```

### 5.3 Create DXF Content

The DXF format is text-based. You can:

1. **Simple approach**: Create a basic template and insert values
2. **Advanced approach**: Use a DXF library or generate complex geometries

Example for a simple rectangle:

```typescript
private static generateBeamDesign(length: number, width: number, height: number): string {
  return `0
SECTION
2
ENTITIES
0
LINE
8
0
10
0.0
20
0.0
11
${length}
21
0.0
0
LINE
8
0
10
${length}
20
0.0
11
${length}
21
${width}
0
ENDSEC
0
EOF`;
}
```

## Step 6: Advanced Features

### 6.1 Multiple Sheets

If your Excel has multiple sheets, create separate configurations:

```typescript
export const sheet1Config: WorkbookConfig = { ... };
export const sheet2Config: WorkbookConfig = { ... };
```

### 6.2 Complex Formulas

For very complex formulas, you can:

1. Break them into smaller steps
2. Use intermediate cells
3. Test each part separately

Example:
```typescript
// Instead of one complex formula:
{ address: 'B10', formula: '=((B1*B2)+(B3*B4))/(B5-B6)', isInput: false }

// Break it down:
{ address: 'B8', formula: '=B1*B2', isInput: false },
{ address: 'B9', formula: '=B3*B4', isInput: false },
{ address: 'B10', formula: '=(B8+B9)/(B5-B6)', isInput: false },
```

### 6.3 Conditional Formatting

To highlight cells based on conditions, add className:

```typescript
{ 
  address: 'B10', 
  formula: '=IF(B5>100,"FAIL","PASS")', 
  isInput: false,
  className: 'bg-red-100' // Custom styling
}
```

## Step 7: Validation

### 7.1 Test Cases

Create test cases matching your Excel:

| Input (B1) | Input (B2) | Expected (B5) |
|------------|------------|---------------|
| 10 | 5 | 50 |
| 20 | 3 | 60 |
| 15 | 0 | 0 |

### 7.2 Compare Results

1. Enter values in Excel → note results
2. Enter same values in web app → compare results
3. They should match exactly

## Troubleshooting

### Formula Not Calculating

**Problem**: Formula cell shows error or wrong value

**Solutions**:
1. Check cell references are correct (A1, B2, etc.)
2. Verify formula syntax matches Excel
3. Ensure referenced cells exist in configuration
4. Check for circular references

### Cell Not Editable

**Problem**: Can't edit a cell that should be input

**Solution**: Set `isInput: true` for that cell

### Wrong Cell Address

**Problem**: Values appear in wrong cells

**Solution**: 
- Verify address format: `'A1'`, `'B2'`, `'AA10'`
- Remember: Rows are 1-indexed, columns are letters
- Check rows and cols in config match your needs

### AutoCAD File Won't Open

**Problem**: DXF file doesn't open in AutoCAD

**Solutions**:
1. Validate DXF syntax
2. Check for missing sections (HEADER, ENTITIES, EOF)
3. Ensure numeric values are properly formatted
4. Test with a simple DXF first

## Example: Complete Conversion

### Original Excel:

```
     A              B
1    Length         10
2    Width          5
3    Height         3
4
5    Area           =B1*B2
6    Volume         =B1*B2*B3
7    Perimeter      =2*(B1+B2)
```

### Converted Configuration:

```typescript
export const myWorkbookConfig: WorkbookConfig = {
  name: 'Box Calculator',
  description: 'Calculate box dimensions',
  rows: 10,
  cols: 5,
  cells: [
    { address: 'A1', value: 'Length', isInput: false },
    { address: 'B1', value: 10, isInput: true },
    
    { address: 'A2', value: 'Width', isInput: false },
    { address: 'B2', value: 5, isInput: true },
    
    { address: 'A3', value: 'Height', isInput: false },
    { address: 'B3', value: 3, isInput: true },
    
    { address: 'A5', value: 'Area', isInput: false },
    { address: 'B5', formula: '=B1*B2', isInput: false },
    
    { address: 'A6', value: 'Volume', isInput: false },
    { address: 'B6', formula: '=B1*B2*B3', isInput: false },
    
    { address: 'A7', value: 'Perimeter', isInput: false },
    { address: 'B7', formula: '=2*(B1+B2)', isInput: false },
  ],
};
```

## Next Steps

1. ✅ Complete your configuration
2. ✅ Test thoroughly with various inputs
3. ✅ Customize the UI if needed
4. ✅ Set up AutoCAD export
5. ✅ Deploy to production

---

**Need Help?** Check the main README.md for additional resources and examples.
