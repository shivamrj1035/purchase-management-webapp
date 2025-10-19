# 🧪 Quick Test Guide - Funding Sources Feature

## Prerequisites

✅ Frontend running on http://localhost:3000  
✅ Firebase configured with valid credentials  
✅ User registered and logged in

---

## Test Scenario 1: Add a Bank Loan

### Steps:

1. Navigate to: http://localhost:3000/dashboard/funding-sources
2. Click **"Add Funding Source"** button (top right)
3. Fill in the form:
   - **Source Name:** "HDFC Home Loan"
   - **Source Type:** Select "Bank Loan"
   - **Principal Amount:** 5000000
   - **Interest Rate:** 8.5
   - **Tenure (Months):** 240
   - **Bank Name:** "HDFC Bank"
   - **Account Number:** "1234567890"
   - **Status:** "Active"
4. Click **"Add Funding Source"**

### Expected Results:

✅ Success toast appears: "Funding source added successfully"  
✅ Dialog closes automatically  
✅ New loan appears in the list  
✅ Summary cards update:

- Total Funding: ₹50,00,000
- Monthly EMI: ₹43,391
- Active Sources: 1

---

## Test Scenario 2: View Amortization Schedule

### Steps:

1. Find the newly created "HDFC Home Loan" in the list
2. Click the **👁 (Eye/View)** button
3. Dialog opens showing:
   - Basic Information card
   - Loan Details card
   - Amortization Schedule table

### Expected Results:

✅ Dialog displays comprehensive loan details  
✅ EMI Amount shows: ₹43,391.16  
✅ Total Interest shows: ₹54,13,878  
✅ Amortization table shows first 12 months  
✅ Each row shows:

- Month number
- Payment date
- EMI amount
- Principal paid (green)
- Interest paid (amber)
- Remaining balance

---

## Test Scenario 3: Add Personal Contribution

### Steps:

1. Click **"Add Funding Source"** again
2. Fill in the form:
   - **Source Name:** "Personal Savings"
   - **Source Type:** Select "Personal Contribution"
   - **Principal Amount:** 1000000
   - **Status:** "Active"
3. Click **"Add Funding Source"**

### Expected Results:

✅ Success toast appears  
✅ New contribution appears in list  
✅ Summary cards update:

- Total Funding: ₹60,00,000 (50L + 10L)
- Monthly EMI: ₹43,391 (unchanged, no EMI for contributions)
- Active Sources: 2

---

## Test Scenario 4: Edit a Funding Source

### Steps:

1. Find "Personal Savings" in the list
2. Click the **✏ (Edit)** button
3. Change:
   - **Principal Amount:** 1500000
   - **Status:** "Pending"
4. Click **"Update Funding Source"**

### Expected Results:

✅ Success toast: "Funding source updated successfully"  
✅ Dialog closes  
✅ List updates with new amount  
✅ Status badge changes to "PENDING" (amber color)  
✅ Summary cards update:

- Total Funding: ₹65,00,000

---

## Test Scenario 5: Delete a Funding Source

### Steps:

1. Find "Personal Savings" in the list
2. Click the **🗑 (Trash/Delete)** button
3. Confirmation dialog appears: "Are you sure you want to delete this funding source?"
4. Click **OK**

### Expected Results:

✅ Success toast: "Funding source deleted successfully"  
✅ Source removed from list  
✅ Summary cards update:

- Total Funding: ₹50,00,000
- Active Sources: 1

---

## Test Scenario 6: Form Validation

### Steps:

1. Click **"Add Funding Source"**
2. Leave **Source Name** empty
3. Click **"Add Funding Source"**

### Expected Results:

✅ Error toast: "Please fill in all required fields"  
✅ Form does not submit  
✅ Dialog remains open

### Additional Validation Tests:

- Try **Principal Amount: 0** → Error: "Principal amount must be greater than 0"
- Try **Bank Loan** with empty **Interest Rate** → Error: "Please enter valid interest rate and tenure for bank loan"
- Try **Bank Loan** with empty **Tenure** → Same error as above

---

## Test Scenario 7: Responsive Design

### Steps:

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different viewports:
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1920px width

### Expected Results:

✅ **Mobile (375px):**

- Summary cards stack vertically
- List items full width
- Dialog scrolls vertically
- Table scrolls horizontally

✅ **Tablet (768px):**

- Summary cards in 2 columns
- List items full width
- Dialog width adjusts

✅ **Desktop (1920px):**

- Summary cards in 3 columns
- List items well-spaced
- Dialog centered with max-width

---

## Test Scenario 8: Empty State

### Steps:

1. Delete all funding sources
2. Observe the page

### Expected Results:

✅ Empty state displays:

- 💼 Wallet icon (centered)
- Message: "No funding sources yet"
- **"Add Your First Funding Source"** button

✅ Summary cards show:

- Total Funding: ₹0
- Monthly EMI: ₹0
- Active Sources: 0

---

## Test Scenario 9: Navigation from Dashboard

### Steps:

1. Navigate to: http://localhost:3000/dashboard
2. Click **"Add Funding Source"** button in the "Total Funding" card
3. OR click the **"Funding Sources"** quick link card

### Expected Results:

✅ Navigates to `/dashboard/funding-sources`  
✅ Page loads with list (or empty state)  
✅ "Add Funding Source" button visible

---

## Test Scenario 10: Real-time Sync (Multi-tab)

### Steps:

1. Open two browser tabs with the funding sources page
2. In Tab 1: Add a new funding source
3. In Tab 2: Manually refresh the page

### Expected Results:

✅ Tab 2 shows the newly added source after refresh  
_(Note: Real-time live updates require Firestore onSnapshot, currently using getDocs)_

---

## Quick EMI Calculation Verification

### Test Data:

**Principal:** ₹50,00,000  
**Rate:** 8.5% p.a.  
**Tenure:** 240 months (20 years)

### Manual Calculation:

```
P = 5,000,000
R = 8.5 / 12 / 100 = 0.00708333
N = 240

EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
    = [5000000 × 0.00708333 × (1.00708333)^240] / [(1.00708333)^240 - 1]
    = [35416.65 × 5.2286] / [4.2286]
    = 185,178.87 / 4.2286
    = 43,391.16
```

### Expected in App:

✅ EMI Amount: ₹43,391.16 (exact match)  
✅ First Month Principal: ₹7,891.16  
✅ First Month Interest: ₹35,500.00  
✅ Total Interest (240 months): ₹54,13,878

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:** Restart TypeScript server in IDE or reload window

### Issue: Empty list even after adding sources

**Solution:** Check browser console for Firebase errors, verify .env.local configuration

### Issue: EMI shows as 0 for bank loan

**Solution:** Ensure Interest Rate and Tenure are filled in when source type is "Bank Loan"

### Issue: Dialog doesn't open

**Solution:** Check browser console for errors, ensure all dialog components are imported correctly

---

## Success Criteria

After all tests, you should see:
✅ All CRUD operations working  
✅ EMI calculations accurate  
✅ Amortization schedule generated correctly  
✅ Form validation preventing invalid data  
✅ Toast notifications for all actions  
✅ Responsive design on all screen sizes  
✅ Dark theme consistent throughout  
✅ No console errors

---

## Next Steps After Testing

If all tests pass:

1. ✅ Funding Sources feature is production-ready
2. 🚀 Proceed to Phase 5: EMI Payments Tracking
3. 📊 Begin implementing payment recording and tracking

If tests fail:

1. 🐛 Check browser console for errors
2. 🔍 Verify Firebase configuration
3. 📝 Review code for syntax errors
4. 🔄 Restart development server

---

**Happy Testing! 🎉**

_All tests should complete in < 15 minutes_
