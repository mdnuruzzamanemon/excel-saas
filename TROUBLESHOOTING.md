# Troubleshooting Guide

## Common Errors and Solutions

### Error: "Objects are not valid as a React child"

**Full Error Message:**
```
Objects are not valid as a React child (found: object with keys {value, type, message})
```

#### What Causes This?

This error occurs when your Excel file contains:
1. **Formula errors** (e.g., `#REF!`, `#VALUE!`, `#DIV/0!`, `#N/A`)
2. **Chart data** (embedded charts or chart references)
3. **Complex objects** that can't be displayed as text

#### Why It Happens

When HyperFormula (the calculation engine) encounters an error in a formula, it returns an error object like:
```javascript
{
  value: "#REF!",
  type: "error",
  message: "Cell reference is invalid"
}
```

React cannot render objects directly, causing the error.

#### ✅ Solution (Already Fixed!)

The system now automatically:
1. **Detects error objects** from HyperFormula
2. **Converts them to strings** (e.g., "#REF!" becomes the text "#REF!")
3. **Skips chart data** during Excel parsing
4. **Displays errors as text** instead of objects

#### How to Verify the Fix

1. **Upload your Excel file again** via admin panel
2. **Click "View"** to open the calculator
3. **Check the cells** - error cells will show as text (e.g., "#REF!")
4. **No more React error!**

---

## Excel File Issues

### Issue: Cells Show "#REF!" or "#VALUE!"

**Cause:** Your Excel file has formula errors

**Solutions:**

1. **Fix in Excel first** (Recommended)
   - Open your Excel file
   - Find cells with errors
   - Fix the formulas
   - Re-upload to the platform

2. **Ignore the errors** (If not critical)
   - The system will display them as text
   - They won't break the calculator
   - Other formulas will still work

### Issue: Some Calculations Don't Work

**Possible Causes:**

1. **Circular references**
   ```
   A1: =B1
   B1: =A1  ← Circular!
   ```
   **Solution:** Break the circular dependency

2. **Missing cell references**
   ```
   Formula: =A10+B10
   But A10 or B10 doesn't exist in uploaded data
   ```
   **Solution:** Ensure all referenced cells are in the Excel file

3. **Unsupported functions**
   ```
   Some advanced Excel functions may not be supported
   ```
   **Solution:** Check HyperFormula documentation for supported functions

### Issue: Charts Are Missing

**This is expected!** 

Charts are intentionally skipped because:
- ✅ You only need the calculations
- ✅ Charts can't be displayed in web interface
- ✅ Chart data causes rendering errors

**What you get instead:**
- ✅ All formulas work
- ✅ All calculations work
- ✅ Input/output cells work
- ✅ Export to AutoCAD works

---

## Upload Issues

### Issue: Upload Fails

**Error:** "Failed to upload Excel file"

**Solutions:**

1. **Check file format**
   - Must be `.xlsx`, `.xls`, or `.xlsm`
   - Not `.csv` or `.txt`

2. **Check file size**
   - Keep under 10 MB
   - Large files may timeout

3. **Check file integrity**
   - Open in Excel to verify it's not corrupted
   - Save a fresh copy and try again

### Issue: Upload Succeeds but View Fails

**Symptoms:**
- File uploads successfully
- Shows in workbook list
- But clicking "View" shows error

**Solutions:**

1. **Check browser console** (F12)
   - Look for specific error messages
   - Share with developer if needed

2. **Try re-uploading**
   - Delete the workbook
   - Upload again

3. **Simplify the Excel file**
   - Remove charts
   - Remove complex formatting
   - Remove unused sheets
   - Keep only first sheet with data

---

## Display Issues

### Issue: Cells Show Empty When They Should Have Values

**Cause:** Cell value is an object or error

**Solution:** Already fixed! System now converts objects to strings.

### Issue: Some Cells Are Not Editable

**This is by design!**

- **Blue cells** = Editable (input cells)
- **Gray cells** = Read-only (formula cells)

If a cell should be editable but isn't:
1. It has a formula (formulas can't be edited by users)
2. It's a text label (labels can't be edited)

### Issue: Calculations Don't Update

**Solutions:**

1. **Wait a moment** - Calculations may take 1-2 seconds
2. **Check internet connection** - Calculations happen on server
3. **Refresh the page** - Reload the calculator
4. **Check browser console** - Look for errors

---

## Performance Issues

### Issue: Large Excel Files Are Slow

**Symptoms:**
- Upload takes long time
- View page loads slowly
- Calculations are slow

**Solutions:**

1. **Reduce file size**
   - Remove unused rows/columns
   - Remove charts and images
   - Keep only necessary data

2. **Simplify formulas**
   - Break complex formulas into steps
   - Avoid array formulas if possible
   - Use simpler functions

3. **Limit dimensions**
   - Keep rows < 100
   - Keep columns < 50
   - System works best with smaller sheets

---

## Formula Issues

### Supported Excel Functions

The system supports 400+ Excel functions including:

**Math:** SUM, AVERAGE, MIN, MAX, ROUND, ABS, SQRT, POWER

**Logical:** IF, AND, OR, NOT, IFERROR

**Lookup:** VLOOKUP, HLOOKUP, INDEX, MATCH

**Text:** CONCATENATE, LEFT, RIGHT, MID, UPPER, LOWER

**Date:** TODAY, NOW, DATE, YEAR, MONTH, DAY

### Unsupported Features

- ❌ VBA Macros (use formulas instead)
- ❌ External data connections
- ❌ Pivot tables
- ❌ Some advanced statistical functions
- ❌ Custom functions

---

## Error Messages Reference

### "#REF!"
**Meaning:** Invalid cell reference

**Example:**
```
=A10+B10  but A10 doesn't exist
```

**Solution:** Fix the cell reference in Excel

### "#VALUE!"
**Meaning:** Wrong type of argument

**Example:**
```
=SUM("text")  ← Can't sum text
```

**Solution:** Ensure correct data types

### "#DIV/0!"
**Meaning:** Division by zero

**Example:**
```
=A1/B1  where B1 = 0
```

**Solution:** Add IF check: `=IF(B1=0, 0, A1/B1)`

### "#N/A"
**Meaning:** Value not available

**Example:**
```
=VLOOKUP(value, range, col)  ← Value not found
```

**Solution:** Use IFERROR: `=IFERROR(VLOOKUP(...), 0)`

### "#NAME?"
**Meaning:** Unrecognized function name

**Example:**
```
=CUSTOMFUNCTION()  ← Not supported
```

**Solution:** Use supported Excel functions only

---

## Getting Help

### Debug Steps

1. **Check browser console** (Press F12)
   - Look for error messages
   - Note the error details

2. **Check server logs**
   - Look at terminal where `npm run dev` is running
   - Note any error messages

3. **Simplify the problem**
   - Create a minimal Excel file
   - Test with simple formulas
   - Add complexity gradually

### Information to Provide

When reporting issues, include:

1. **Excel file details**
   - File format (.xlsx, .xls, .xlsm)
   - Number of rows and columns
   - Types of formulas used

2. **Error message**
   - Full error text
   - Browser console errors
   - Server terminal errors

3. **Steps to reproduce**
   - What you did
   - What you expected
   - What actually happened

---

## Quick Fixes

### "Objects are not valid as a React child"
✅ **Fixed!** Re-upload your file and try again.

### "Workbook not found"
🔧 Check the URL has correct `?workbookId=xxx`

### "Failed to load workbook"
🔧 Refresh the page or re-upload the file

### "Calculation failed"
🔧 Check for formula errors in Excel first

### Charts are missing
✅ **Expected!** Charts are intentionally skipped.

---

**Most issues are now automatically handled by the system!** 🎉

If you encounter a new issue, check the browser console (F12) for specific error details.
