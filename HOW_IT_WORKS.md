# How Excel File Storage Works

## 📋 Quick Answer

**The Excel file itself is NOT stored.** Only the extracted data (formulas, values, structure) is stored in the database.

## 🔄 Complete Workflow

### Step 1: Upload (Admin Panel)

When you upload an Excel file:

```
1. You select file: "beam-calculator.xlsx" (500 KB)
2. Browser sends file to server
3. Server receives the file temporarily in memory
```

### Step 2: Parsing (Server)

The server immediately processes the file:

```javascript
// Server reads the Excel file
const workbook = XLSX.read(buffer);

// Extracts data:
- Cell A1: "Length" (text)
- Cell B1: 10 (number)
- Cell B5: =B1*B2 (formula)
- etc.
```

### Step 3: Storage (Database)

Only the **extracted data** is saved to SQLite database:

```json
{
  "id": "abc123",
  "name": "Beam Calculator",
  "formulaConfig": {
    "cells": [
      {"address": "B1", "value": 10, "isInput": true},
      {"address": "B5", "formula": "=B1*B2", "isInput": false}
    ]
  },
  "metadata": {
    "rows": 20,
    "cols": 10,
    "fileName": "beam-calculator.xlsx"
  }
}
```

### Step 4: Excel File Discarded

```
✅ Data extracted and stored in database
❌ Original Excel file is DELETED from memory
❌ Excel file is NOT saved to disk
```

## 💾 What Gets Stored

### ✅ Stored in Database (SQLite)

**Location**: `prisma/dev.db`

**Data Stored**:
1. **Workbook metadata**
   - Name: "Beam Calculator"
   - Description
   - Upload date
   - File name (for reference only)

2. **Formula configuration** (JSON)
   - Cell addresses: A1, B1, B5, etc.
   - Cell values: 10, 5, "Length"
   - Cell formulas: =B1*B2, =SUM(A1:A10)
   - Cell types: input/output

3. **Structure information**
   - Number of rows
   - Number of columns

### ❌ NOT Stored

- ❌ Original Excel file (.xlsx binary)
- ❌ Charts
- ❌ Images
- ❌ Formatting (colors, fonts)
- ❌ VBA macros
- ❌ Comments
- ❌ Hidden sheets

## 📊 Database Structure

```
prisma/dev.db (SQLite Database)
│
├── Workbook Table
│   ├── id: "abc123"
│   ├── name: "Beam Calculator"
│   ├── description: "..."
│   ├── formulaConfig: {...}  ← Your formulas stored here!
│   ├── metadata: {...}
│   ├── createdAt: "2025-10-29..."
│   └── updatedAt: "2025-10-29..."
│
└── Calculation Table (for user sessions)
    ├── id: "xyz789"
    ├── workbookId: "abc123"
    ├── inputData: {...}
    └── outputData: {...}
```

## 🔍 Example: What Happens to Your Excel File

### Your Excel File (500 KB)

```
BeamAnalysis.xlsx
├── Sheet1: BeamAnalysis
│   ├── Cell A1: "Beam Length"
│   ├── Cell B1: 10
│   ├── Cell B5: =B1*B2
│   └── Chart1 (embedded chart)
├── Formatting (colors, fonts)
└── File size: 500 KB
```

### What Gets Stored in Database (~5 KB)

```json
{
  "id": "clx123abc",
  "name": "Beam Calculator",
  "formulaConfig": {
    "name": "Beam Calculator",
    "rows": 20,
    "cols": 10,
    "cells": [
      {
        "address": "A1",
        "value": "Beam Length",
        "isInput": false
      },
      {
        "address": "B1",
        "value": 10,
        "isInput": true
      },
      {
        "address": "B5",
        "formula": "=B1*B2",
        "isInput": false
      }
    ]
  },
  "metadata": {
    "fileName": "BeamAnalysis.xlsx",
    "rows": 20,
    "cols": 10,
    "uploadedAt": "2025-10-29T06:00:00Z"
  }
}
```

**Size reduction**: 500 KB → ~5 KB (100x smaller!)

## 🔐 Security Implications

### Why This Is Secure

1. **Original file deleted** - Can't be downloaded
2. **Only formulas stored** - In JSON format
3. **Formulas never sent to browser** - Stay on server
4. **Users see only results** - Not the formulas

### What Users Can Access

```
User requests: /?workbookId=abc123

Server sends:
✅ Cell layout (which cells are inputs)
✅ Initial values (10, 5, etc.)
✅ Cell labels ("Length", "Width")

Server NEVER sends:
❌ Formulas (=B1*B2)
❌ Original Excel file
❌ Formula definitions
```

## 🗂️ File Locations

### Development (Your Computer)

```
excel-saas/
├── prisma/
│   └── dev.db              ← SQLite database (all data here!)
├── node_modules/
├── app/
└── lib/
```

**Database location**: `prisma/dev.db`
**Size**: Usually < 1 MB for dozens of workbooks

### Production (Linux Server)

```
/var/www/excel-saas/
├── prisma/
│   └── production.db       ← Production database
└── ...
```

Or with PostgreSQL:
```
PostgreSQL Server
└── excel_saas database
    └── workbook table
```

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 1. UPLOAD                                                │
│                                                          │
│  Excel File (500 KB)                                     │
│       ↓                                                  │
│  Browser → Server (temporary memory)                     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. PARSE                                                 │
│                                                          │
│  Server extracts:                                        │
│  - Formulas: =B1*B2                                      │
│  - Values: 10, 5                                         │
│  - Structure: 20 rows, 10 cols                           │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. STORE                                                 │
│                                                          │
│  SQLite Database (prisma/dev.db)                         │
│  - Workbook record created                               │
│  - JSON data stored (~5 KB)                              │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. DISCARD                                               │
│                                                          │
│  Original Excel file DELETED from memory                 │
│  (No longer needed)                                      │
└─────────────────────────────────────────────────────────┘
```

## 📝 User Calculation Flow

```
┌─────────────────────────────────────────────────────────┐
│ USER OPENS: /?workbookId=abc123                          │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ Server loads from database:                              │
│ - Cell layout                                            │
│ - Initial values                                         │
│ - Which cells are editable                               │
│ (Formulas stay on server!)                               │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ User edits: B1 = 15                                      │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ Browser sends: {B1: 15}                                  │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ Server calculates using stored formulas:                 │
│ B5 = B1 * B2 = 15 * 5 = 75                              │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ Server sends back: {B5: 75}                              │
│ (Formula =B1*B2 never sent!)                             │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Key Points

1. **Excel file is temporary** - Only exists during upload
2. **Data is extracted** - Formulas, values, structure
3. **Stored in database** - SQLite (dev) or PostgreSQL (prod)
4. **Original file deleted** - Not saved anywhere
5. **Formulas protected** - Never leave the server
6. **Users see results only** - Not the formulas

## 🔍 How to View Stored Data

### Option 1: Prisma Studio (GUI)

```bash
npx prisma studio
```

Opens: `http://localhost:5555`

You can see:
- All workbooks
- Formula configurations
- Metadata

### Option 2: Database File

```bash
# View SQLite database
sqlite3 prisma/dev.db

# List tables
.tables

# View workbooks
SELECT * FROM Workbook;
```

## 💡 Why This Approach?

### Advantages

1. **Security** - Original file can't be stolen
2. **Efficiency** - Store only what's needed (5 KB vs 500 KB)
3. **Speed** - Fast database queries
4. **Scalability** - Can handle thousands of workbooks
5. **Protection** - Formulas never exposed

### Trade-offs

1. **No Excel file download** - By design (security feature)
2. **Charts not stored** - Only calculations
3. **Formatting lost** - Only data and formulas

## 📊 Storage Size Comparison

| Item | Size | Stored? |
|------|------|---------|
| Original Excel file | 500 KB | ❌ No |
| Extracted formulas | 2 KB | ✅ Yes |
| Cell values | 1 KB | ✅ Yes |
| Metadata | 0.5 KB | ✅ Yes |
| Charts | 200 KB | ❌ No |
| Formatting | 50 KB | ❌ No |
| **Total stored** | **~3.5 KB** | ✅ |

**Efficiency**: 99% reduction in storage!

---

**Summary**: Your Excel file is parsed once during upload, data is extracted and stored in the database, then the original file is discarded. Users interact with the database data, never with the Excel file itself. This keeps your formulas secure! 🔒
