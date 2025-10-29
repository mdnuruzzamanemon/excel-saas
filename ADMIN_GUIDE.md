# Admin Panel Guide

## Overview

The admin panel allows you to upload Excel files and automatically convert them into secure web calculators.

## How to Access

1. **Admin Panel**: Visit `http://localhost:3000/admin`
2. **User Page**: Visit `http://localhost:3000`

## Step-by-Step: Upload Your Excel File

### Step 1: Prepare Your Excel File

Your Excel file should have:
- **Input cells**: Numeric values that users will edit (e.g., dimensions, quantities)
- **Formula cells**: Cells with Excel formulas (e.g., `=A1*B1`, `=SUM(A1:A10)`)
- **Label cells**: Text descriptions (e.g., "Length", "Width", "Total")

**Example Excel Structure:**

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

### Step 2: Upload via Admin Panel

1. Go to `http://localhost:3000/admin`
2. Enter a **Workbook Name** (e.g., "Box Calculator")
3. Click **Choose File** and select your Excel file (.xlsx or .xls)
4. Click **Upload Excel File**

### Step 3: System Processing

The system automatically:
- ✅ Extracts all formulas from your Excel
- ✅ Identifies input cells (numeric values)
- ✅ Identifies formula cells (calculations)
- ✅ Identifies label cells (text)
- ✅ Stores formulas securely on the server
- ✅ Creates a user interface

### Step 4: View Your Calculator

After upload:
1. Click the **View** button next to your workbook
2. Opens the user page with your calculator
3. Users can edit blue cells (inputs)
4. Gray cells show calculated results
5. Formulas are never exposed!

## What Gets Uploaded

### ✅ Uploaded to Server (Secure)
- All Excel formulas
- Cell structure and relationships
- Calculation logic

### ❌ NOT Accessible to Users
- Formula definitions
- Excel file itself
- Calculation methods

### ✅ Visible to Users
- Input fields (blue cells)
- Calculated results (gray cells)
- Labels and descriptions

## Managing Workbooks

### View Workbooks
- All uploaded workbooks appear in the "Your Workbooks" section
- Shows: Name, description, size, upload date

### View Calculator
- Click **View** button to open the user interface
- Opens in new tab with URL: `/?workbookId=xxx`
- Share this URL with your customers

### Delete Workbooks
- Click the **Trash** icon to delete
- Confirms before deletion
- Permanently removes the workbook

## Excel File Requirements

### Supported Formats
- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)
- `.xlsm` (Excel with Macros)

### Supported Features
- ✅ Basic arithmetic: `+`, `-`, `*`, `/`, `^`
- ✅ Functions: `SUM`, `AVERAGE`, `IF`, `VLOOKUP`, `INDEX`, `MATCH`
- ✅ Cell references: `A1`, `$A$1`
- ✅ Ranges: `A1:A10`, `B1:D5`
- ✅ Conditional logic: `IF`, `AND`, `OR`
- ✅ Math functions: `ROUND`, `ABS`, `SQRT`, `POWER`

### Not Supported
- ❌ VBA Macros (`.xlsm` files are accepted, but macros won't execute)
- ❌ External data connections
- ❌ Pivot tables
- ❌ Charts (data only)
- ❌ Multiple sheets (first sheet only)

### Important Note About .xlsm Files
- ✅ `.xlsm` files CAN be uploaded
- ✅ Cell values and formulas will be extracted
- ❌ VBA macros will NOT execute
- ℹ️ Only Excel formulas (not VBA code) will work in the web calculator

## Cell Type Detection

The system automatically categorizes cells:

### Input Cells (Blue - Editable)
- Numeric values without formulas
- Example: `10`, `5.5`, `100`
- Users can edit these

### Formula Cells (Gray - Read-only)
- Cells with formulas
- Example: `=A1*B1`, `=SUM(A1:A10)`
- Calculated automatically

### Label Cells (Gray - Read-only)
- Text values
- Example: "Length", "Width", "Total"
- Displayed as labels

## Example Workflow

### 1. Create Excel File

Create a file named `beam-calculator.xlsx`:

```
     A                    B
1    INPUTS
2    Beam Length (m)      10
3    Load (kN)            50
4    Material Factor      1.5
5    
6    CALCULATIONS
7    Total Load           =B3*B4
8    Load per meter       =B7/B2
9    Max Moment           =(B7*B2)/8
```

### 2. Upload to Admin Panel

1. Visit: `http://localhost:3000/admin`
2. Name: "Beam Calculator"
3. Upload: `beam-calculator.xlsx`
4. Click: "Upload Excel File"

### 3. System Creates

- **Input cells**: B2, B3, B4 (users can edit)
- **Formula cells**: B7, B8, B9 (auto-calculated)
- **Label cells**: A1-A9 (descriptions)

### 4. Share with Users

- Copy the View URL: `http://localhost:3000/?workbookId=xxx`
- Share with customers
- They can use the calculator
- Your formulas stay protected!

## Testing Your Upload

After uploading, test:

1. ✅ Can you edit input cells?
2. ✅ Do calculations update in real-time?
3. ✅ Do results match your Excel file?
4. ✅ Can you export to AutoCAD?
5. ✅ Are formulas hidden from users?

## Troubleshooting

### Upload Fails

**Problem**: "Failed to upload Excel file"

**Solutions**:
- Check file format (.xlsx or .xls)
- Ensure file is not corrupted
- Try re-saving in Excel
- Check file size (< 10MB recommended)

### Calculations Don't Match Excel

**Problem**: Results differ from Excel

**Solutions**:
- Verify all formulas are supported
- Check for circular references
- Ensure all referenced cells exist
- Test with simple formulas first

### Can't See Workbook

**Problem**: Workbook doesn't appear after upload

**Solutions**:
- Refresh the admin page
- Check browser console for errors
- Verify database connection
- Check server logs

## Security Notes

### Your Formulas Are Protected

- ✅ Stored only on server
- ✅ Never sent to browser
- ✅ Not in page source
- ✅ Not in API responses
- ✅ Cannot be extracted by users

### What Users See

- ✅ Input fields (blue cells)
- ✅ Calculated results (gray cells)
- ✅ Labels and descriptions
- ❌ Formula definitions
- ❌ Excel file
- ❌ Calculation logic

## Advanced: Multiple Workbooks

You can upload multiple Excel files:

1. **Different Calculators**: Beam, Column, Foundation, etc.
2. **Different Versions**: v1, v2, v3
3. **Different Customers**: Custom calculators per client

Each workbook gets a unique URL:
- `/?workbookId=abc123` - Beam Calculator
- `/?workbookId=def456` - Column Calculator
- `/?workbookId=ghi789` - Foundation Calculator

## Next Steps

1. ✅ Upload your Excel file
2. ✅ Test the calculator
3. ✅ Verify calculations
4. ✅ Customize AutoCAD export (optional)
5. ✅ Share with users
6. ✅ Deploy to production

## Support

If you encounter issues:
1. Check the browser console (F12)
2. Check server logs
3. Verify Excel file format
4. Test with a simple Excel file first

---

**Your Excel formulas are now protected and ready to share! 🎉**
