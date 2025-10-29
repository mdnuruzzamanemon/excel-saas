# .xlsm File Support

## ✅ Yes, .xlsm Files Are Supported!

You can now upload `.xlsm` (Excel files with macros) to the admin panel.

## 📋 What Works

### ✅ Supported from .xlsm Files
- **Excel formulas** (e.g., `=A1+B1`, `=SUM(A1:A10)`, `=IF(A1>10,"Yes","No")`)
- **Cell values** (numbers, text)
- **Cell references** (A1, B2, etc.)
- **Named ranges** (if used in formulas)
- **All Excel functions** supported by HyperFormula

### ❌ Not Supported from .xlsm Files
- **VBA Macros** - Will not execute
- **Custom VBA functions** - Won't work
- **Macro buttons** - Won't appear
- **UserForms** - Not supported
- **ActiveX controls** - Not supported

## 🎯 How It Works

### Example .xlsm File

Your Excel file has:
```vb
' VBA Macro (won't execute)
Sub CalculateTotal()
    Range("B10").Value = Range("B1").Value * Range("B2").Value
End Sub
```

And cells:
```
A1: "Price"        B1: 100
A2: "Quantity"     B2: 5
A3: "Total"        B3: =B1*B2    ← This formula WILL work!
```

### What Gets Extracted

When you upload:
- ✅ Cell B3 formula `=B1*B2` is extracted and works
- ❌ VBA macro `CalculateTotal()` is ignored
- ✅ Values in B1 and B2 become editable inputs
- ✅ B3 calculates automatically when B1 or B2 changes

## 💡 Best Practice

If your `.xlsm` file uses VBA macros, you should:

1. **Convert VBA logic to Excel formulas** where possible
2. **Replace macro calculations with cell formulas**
3. **Test the file** after upload to ensure calculations work

### Example Conversion

**Before (VBA Macro):**
```vb
Sub Calculate()
    Dim total As Double
    total = Range("B1").Value * Range("B2").Value * 1.15
    Range("B3").Value = total
End Sub
```

**After (Excel Formula):**
```
B3: =B1*B2*1.15
```

The formula version will work perfectly in the web calculator!

## 🔧 Supported Excel Functions

The system supports 400+ Excel functions including:

### Math & Arithmetic
- `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`
- `ROUND`, `ROUNDUP`, `ROUNDDOWN`
- `ABS`, `SQRT`, `POWER`, `EXP`, `LN`, `LOG`
- `MOD`, `QUOTIENT`, `CEILING`, `FLOOR`

### Logical
- `IF`, `AND`, `OR`, `NOT`, `XOR`
- `IFERROR`, `IFNA`
- `TRUE`, `FALSE`

### Lookup & Reference
- `VLOOKUP`, `HLOOKUP`, `LOOKUP`
- `INDEX`, `MATCH`
- `OFFSET`, `INDIRECT`
- `CHOOSE`

### Text
- `CONCATENATE`, `CONCAT`, `TEXTJOIN`
- `LEFT`, `RIGHT`, `MID`
- `UPPER`, `LOWER`, `PROPER`
- `TRIM`, `LEN`, `FIND`, `SEARCH`

### Date & Time
- `TODAY`, `NOW`, `DATE`, `TIME`
- `YEAR`, `MONTH`, `DAY`
- `HOUR`, `MINUTE`, `SECOND`
- `DATEDIF`, `NETWORKDAYS`

### Statistical
- `STDEV`, `VAR`, `MEDIAN`, `MODE`
- `PERCENTILE`, `QUARTILE`
- `CORREL`, `COVAR`

### Financial
- `PMT`, `PV`, `FV`, `RATE`, `NPER`
- `NPV`, `IRR`, `XIRR`

## 📝 Upload Instructions

1. Go to admin panel: `http://localhost:3000/admin`
2. Enter workbook name
3. Choose your `.xlsm` file
4. Click "Upload Excel File"
5. System extracts formulas (ignores macros)
6. Test the calculator to verify formulas work

## ⚠️ Important Notes

### If Your File Uses Macros

**Scenario 1: Macros only format cells or UI**
- ✅ Upload will work fine
- ✅ Formulas will calculate correctly
- ℹ️ Formatting won't transfer (but calculations will)

**Scenario 2: Macros perform calculations**
- ⚠️ You need to convert macro logic to formulas
- ⚠️ Or the calculations won't work in web version

**Scenario 3: Macros call external data**
- ❌ Won't work
- ℹ️ Consider hardcoding data or using formulas

### Testing Your .xlsm File

After upload:
1. Click "View" to see the calculator
2. Enter test values
3. Compare results with your Excel file
4. If results differ, check for VBA dependencies

## 🎉 Summary

- ✅ `.xlsm` files CAN be uploaded
- ✅ Excel formulas work perfectly
- ❌ VBA macros do NOT execute
- ✅ Convert macro logic to formulas for best results

**Your Excel formulas (not macros) are protected and ready to use!**
