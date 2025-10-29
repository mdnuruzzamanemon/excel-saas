# Excel to SaaS - Real Conversion Example

This document shows a complete, real-world example of converting an Excel file to the SaaS platform.

## Example: Structural Beam Calculator

### Original Excel File

```
     A                    B           C           D
1    INPUTS
2    Beam Length (m)      10
3    Load (kN)            50
4    Material Factor      1.5
5    
6    CALCULATIONS
7    Total Load (kN)      =B3*B4      (75)
8    Load/meter (kN/m)    =B7/B2      (7.5)
9    Max Moment (kNm)     =(B7*B2)/8  (93.75)
10   
11   RESULTS
12   Req. Section Mod.    =B9/250     (0.375)
13   Safety Check         =IF(B12<1,"PASS","FAIL")
```

### Step 1: Analyze the Structure

**Input Cells** (User can edit):
- B2: Beam Length
- B3: Load
- B4: Material Factor

**Formula Cells** (Calculated):
- B7: `=B3*B4` (Total Load)
- B8: `=B7/B2` (Load per meter)
- B9: `=(B7*B2)/8` (Max Moment)
- B12: `=B9/250` (Section Modulus)
- B13: `=IF(B12<1,"PASS","FAIL")` (Safety Check)

**Label Cells** (Static text):
- A1, A2, A3, A4, A6, A7, A8, A9, A11, A12, A13

### Step 2: Create Configuration

Open `lib/formula-engine.ts` and replace `exampleWorkbookConfig`:

```typescript
export const beamCalculatorConfig: WorkbookConfig = {
  name: 'Structural Beam Calculator',
  description: 'Calculate beam dimensions and load capacity for structural design',
  rows: 15,
  cols: 5,
  cells: [
    // Header
    { address: 'A1', value: 'INPUTS', isInput: false },
    
    // Input Section
    { address: 'A2', value: 'Beam Length (m)', isInput: false },
    { address: 'B2', value: 10, isInput: true, label: 'Beam Length Input' },
    
    { address: 'A3', value: 'Load (kN)', isInput: false },
    { address: 'B3', value: 50, isInput: true, label: 'Load Input' },
    
    { address: 'A4', value: 'Material Factor', isInput: false },
    { address: 'B4', value: 1.5, isInput: true, label: 'Material Factor Input' },
    
    // Calculations Header
    { address: 'A6', value: 'CALCULATIONS', isInput: false },
    
    // Calculation Cells
    { address: 'A7', value: 'Total Load (kN)', isInput: false },
    { address: 'B7', formula: '=B3*B4', isInput: false, label: 'Total Load Result' },
    
    { address: 'A8', value: 'Load per meter (kN/m)', isInput: false },
    { address: 'B8', formula: '=B7/B2', isInput: false, label: 'Load per meter Result' },
    
    { address: 'A9', value: 'Max Moment (kNm)', isInput: false },
    { address: 'B9', formula: '=(B7*B2)/8', isInput: false, label: 'Max Moment Result' },
    
    // Results Header
    { address: 'A11', value: 'RESULTS', isInput: false },
    
    // Result Cells
    { address: 'A12', value: 'Required Section Modulus', isInput: false },
    { address: 'B12', formula: '=B9/250', isInput: false, label: 'Section Modulus Result' },
    
    { address: 'A13', value: 'Safety Check', isInput: false },
    { address: 'B13', formula: '=IF(B12<1,"PASS","FAIL")', isInput: false, label: 'Safety Check Result' },
  ],
};
```

### Step 3: Update API Routes

In `app/api/calculate/route.ts`, change the import:

```typescript
// Change this line:
import { FormulaEngine, exampleWorkbookConfig } from '@/lib/formula-engine';

// To this:
import { FormulaEngine, beamCalculatorConfig } from '@/lib/formula-engine';

// And update the usage:
const config = beamCalculatorConfig;
```

### Step 4: Customize AutoCAD Export

In `lib/dxf-generator.ts`, update the `generate` method:

```typescript
static generate(params: DXFGenerationParams): string {
  const { values } = params;
  
  // Extract calculated values
  const beamLength = values['B2'] || 0;
  const totalLoad = values['B7'] || 0;
  const maxMoment = values['B9'] || 0;
  const sectionModulus = values['B12'] || 0;
  
  // Generate beam drawing
  return this.generateBeamDrawing(beamLength, totalLoad, maxMoment, sectionModulus);
}

private static generateBeamDrawing(
  length: number, 
  load: number, 
  moment: number,
  modulus: number
): string {
  // Calculate beam dimensions based on section modulus
  const beamHeight = Math.sqrt(modulus * 6) * 100; // Convert to mm
  const beamWidth = beamHeight / 2;
  
  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
ENTITIES
0
TEXT
8
0
10
0
20
${beamHeight + 50}
40
20
1
Beam: ${length}m, Load: ${load}kN
0
LINE
8
0
10
0
20
0
11
${length * 1000}
21
0
0
LINE
8
0
10
0
20
0
11
0
21
${beamHeight}
0
LINE
8
0
10
${length * 1000}
20
0
11
${length * 1000}
21
${beamHeight}
0
LINE
8
0
10
0
20
${beamHeight}
11
${length * 1000}
21
${beamHeight}
0
ENDSEC
0
EOF`;
}
```

### Step 5: Test the Conversion

Run the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` and test:

| Test Case | B2 (Length) | B3 (Load) | B4 (Factor) | Expected B7 | Expected B9 | Expected B13 |
|-----------|-------------|-----------|-------------|-------------|-------------|--------------|
| Test 1    | 10          | 50        | 1.5         | 75          | 93.75       | PASS         |
| Test 2    | 8           | 100       | 2.0         | 200         | 200         | PASS         |
| Test 3    | 12          | 200       | 1.2         | 240         | 360         | FAIL         |

### Step 6: Verify Results Match Excel

1. Open your original Excel file
2. Enter the same test values
3. Compare results with the web app
4. They should match exactly!

## More Complex Example: Multi-Section Calculator

### Excel Structure

```
     A                    B           C           D           E
1    Section 1: Dimensions
2    Length               10
3    Width                5
4    Height               3
5    
6    Section 2: Materials
7    Concrete (m³)        =B2*B3*B4
8    Steel (kg)           =B7*7850
9    Cost per m³          500
10   
11   Section 3: Totals
12   Material Cost        =B7*B9
13   Labor Cost           =B12*0.3
14   Total Cost           =B12+B13
```

### Configuration

```typescript
export const multiSectionConfig: WorkbookConfig = {
  name: 'Construction Cost Calculator',
  description: 'Calculate material and labor costs for construction',
  rows: 20,
  cols: 6,
  cells: [
    // Section 1
    { address: 'A1', value: 'Section 1: Dimensions', isInput: false },
    { address: 'A2', value: 'Length', isInput: false },
    { address: 'B2', value: 10, isInput: true },
    { address: 'A3', value: 'Width', isInput: false },
    { address: 'B3', value: 5, isInput: true },
    { address: 'A4', value: 'Height', isInput: false },
    { address: 'B4', value: 3, isInput: true },
    
    // Section 2
    { address: 'A6', value: 'Section 2: Materials', isInput: false },
    { address: 'A7', value: 'Concrete (m³)', isInput: false },
    { address: 'B7', formula: '=B2*B3*B4', isInput: false },
    { address: 'A8', value: 'Steel (kg)', isInput: false },
    { address: 'B8', formula: '=B7*7850', isInput: false },
    { address: 'A9', value: 'Cost per m³', isInput: false },
    { address: 'B9', value: 500, isInput: true },
    
    // Section 3
    { address: 'A11', value: 'Section 3: Totals', isInput: false },
    { address: 'A12', value: 'Material Cost', isInput: false },
    { address: 'B12', formula: '=B7*B9', isInput: false },
    { address: 'A13', value: 'Labor Cost', isInput: false },
    { address: 'B13', formula: '=B12*0.3', isInput: false },
    { address: 'A14', value: 'Total Cost', isInput: false },
    { address: 'B14', formula: '=B12+B13', isInput: false },
  ],
};
```

## Advanced Features

### 1. Conditional Formatting

Add visual feedback based on values:

```typescript
{
  address: 'B13',
  formula: '=IF(B12<1,"PASS","FAIL")',
  isInput: false,
  // This would require custom rendering in the component
}
```

### 2. Multiple Worksheets

Create separate configurations for different calculators:

```typescript
export const worksheet1Config: WorkbookConfig = { /* ... */ };
export const worksheet2Config: WorkbookConfig = { /* ... */ };

// In API route, select based on parameter
const config = workbookId === 'sheet1' ? worksheet1Config : worksheet2Config;
```

### 3. Dynamic Ranges

For calculations with variable-length ranges:

```typescript
{
  address: 'B10',
  formula: '=SUM(B2:B9)',  // Sum a range
  isInput: false,
}
```

### 4. Lookup Tables

Implement VLOOKUP-style functionality:

```typescript
// Define lookup table
{ address: 'D2', value: 'Small', isInput: false },
{ address: 'E2', value: 100, isInput: false },
{ address: 'D3', value: 'Medium', isInput: false },
{ address: 'E3', value: 200, isInput: false },
{ address: 'D4', value: 'Large', isInput: false },
{ address: 'E4', value: 300, isInput: false },

// Use VLOOKUP
{
  address: 'B15',
  formula: '=VLOOKUP(B14,D2:E4,2,FALSE)',
  isInput: false,
}
```

## Troubleshooting Common Conversion Issues

### Issue 1: Formula Returns #REF!

**Cause**: Cell reference doesn't exist in configuration

**Solution**: Ensure all referenced cells are defined:
```typescript
// If formula uses B5, make sure B5 exists:
{ address: 'B5', value: 0, isInput: true }
```

### Issue 2: Circular Reference Error

**Cause**: Formula references itself directly or indirectly

**Solution**: Break the circular dependency:
```typescript
// Bad: B5 = B5 + 1
// Good: Use intermediate cells
{ address: 'B5', formula: '=B4+1', isInput: false }
```

### Issue 3: Results Don't Match Excel

**Cause**: Formula syntax differences or missing cells

**Solution**: 
1. Double-check formula syntax
2. Verify all cell references
3. Test with simple values first
4. Check for rounding differences

## Summary

Converting your Excel to SaaS involves:

1. ✅ Identify input vs formula cells
2. ✅ Extract all formulas
3. ✅ Create configuration in `formula-engine.ts`
4. ✅ Update API routes
5. ✅ Customize AutoCAD export
6. ✅ Test thoroughly
7. ✅ Deploy to production

**Your formulas are now protected and ready to monetize! 🎉**
