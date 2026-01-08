# SUCCESS VERIFICATION TEST CASE

## Test Case ID
**TC_PROFILE_UPDATE_SUCCESS_001**

## Test Case Name
**Complete Profile Update - Success Verification**

## Purpose
Verify that a newly registered user can successfully complete their profile by:
1. Creating a new account via registration
2. Logging in with newly created credentials
3. Navigating to the Profile Page
4. Filling in all required profile information
5. Submitting the profile update successfully

## Preconditions
- IronFX application is accessible at `https://www.ironfx.com`
- Test environment is stable and responsive
- Registration form is fully functional
- Login functionality is working
- Profile page exists and is accessible to logged-in users
- Database is available for storing profile data

## Test Data

### Registration Data
```json
{
  "firstName": "John",
  "lastName": "TestUser",
  "email": "john.testuser+{TIMESTAMP}@example.com",
  "phoneNumber": "1234567890",
  "country": "Germany",
  "accountType": "Standard Floating",
  "bonusScheme": "Not applicable",
  "currency": "USD",
  "leverage": "1:500",
  "password": "SecureTestPassword123!"
}
```

### Profile Data
```json
{
  "nationality": "German",
  "gender": "Male",
  "dateOfBirth": "15/06/1990",
  "taxCountry": "Germany",
  "tin": "12345678901",
  "address1": "123 Main Street",
  "address2": "Apartment 4B",
  "town": "Berlin",
  "postcode": "10115",
  "countryOfResidence": "Germany",
  "landlinePrefix": "+49",
  "landlineNumber": "3032123456",
  "mobilePrefix": "+49",
  "mobileNumber": "1501234567",
  "employmentStatus": "Employed",
  "natureOfBusiness": "Finance",
  "sourceOfFunds": "Salary",
  "expectedDeposit": "5000-10000",
  "annualIncome": "50000-100000",
  "netWorth": "100000-500000",
  "hasSeminarExperience": true,
  "seminarExperienceType": "Advanced",
  "hasWorkExperience": true,
  "frequencyValue": "Daily",
  "volumeValue": "High"
}
```

## Test Steps

### Step 1: Register New Account
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Navigate to registration page | Registration form is displayed |
| 1.2 | Enter first name: "John" | First name field is populated |
| 1.3 | Enter last name: "TestUser" | Last name field is populated |
| 1.4 | Enter email: "john.testuser+{TIMESTAMP}@example.com" | Email field is populated |
| 1.5 | Enter phone number: "1234567890" | Phone number field is populated |
| 1.6 | Select country: "Germany" | Germany is selected in dropdown |
| 1.7 | Select account type: "Standard Floating" | Standard Floating is selected |
| 1.8 | Select bonus scheme: "Not applicable" | Not applicable is selected |
| 1.9 | Select currency: "USD" | USD is selected |
| 1.10 | Select leverage: "1:500" | 1:500 is selected |
| 1.11 | Enter password: "SecureTestPassword123!" | Password field is populated |
| 1.12 | Confirm password: "SecureTestPassword123!" | Confirm password field is populated |
| 1.13 | Click "Open your Trading Account" button | Registration is submitted |
| **Expected**: Account is created successfully | Confirmation message displayed or redirect occurs |

### Step 2: Login with New Account
| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | Navigate to login page | Login form is displayed |
| 2.2 | Enter email from Step 1.3 | Email field is populated |
| 2.3 | Enter password from Step 1.11 | Password field is populated |
| 2.4 | Click "Login" button | Login is submitted |
| **Expected**: User is authenticated | Dashboard or portal home page is displayed |

### Step 3: Navigate to Profile Page
| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | After login, navigate to profile URL | Profile page loads successfully |
| 3.2 | Verify profile form is displayed | All profile sections are visible |
| **Expected**: Profile page is accessible | User can see all profile fields and sections |

### Step 4: Verify Profile Fields are Visible
| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | Verify Nationality field is visible | Field is visible and interactive |
| 4.2 | Verify Gender field is visible | Field is visible and interactive |
| 4.3 | Verify Date of Birth field is visible | Field is visible and interactive |
| 4.4 | Verify Address fields are visible | All address fields are visible |
| 4.5 | Verify Phone fields are visible | All phone fields are visible |
| 4.6 | Verify Employment fields are visible | All employment fields are visible |
| 4.7 | Verify Financial fields are visible | All financial fields are visible |
| 4.8 | Verify Experience fields are visible | All experience fields are visible |
| 4.9 | Verify Update button is visible | Submit button is visible and clickable |
| **Expected**: All fields are accessible | User can interact with all form elements |

### Step 5: Fill Personal Information
| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | Select Nationality: "German" | German is selected and visible |
| 5.2 | Select Gender: "Male" | Male is selected |
| 5.3 | Enter Date of Birth: "15/06/1990" | Date is populated correctly |
| 5.4 | Select Tax Country: "Germany" | Germany is selected |
| 5.5 | Enter TIN: "12345678901" | TIN is populated |
| **Expected**: Personal information is filled | All fields contain correct values |

### Step 6: Fill Address Information
| Step | Action | Expected Result |
|------|--------|-----------------|
| 6.1 | Enter Address 1: "123 Main Street" | Address 1 is populated |
| 6.2 | Enter Address 2: "Apartment 4B" | Address 2 is populated |
| 6.3 | Enter Town: "Berlin" | Town is populated |
| 6.4 | Enter Postcode: "10115" | Postcode is populated |
| 6.5 | Select Country of Residence: "Germany" | Germany is selected |
| **Expected**: Address information is complete | All address fields contain correct values |

### Step 7: Fill Phone Information
| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.1 | Select Landline Prefix: "+49" | Prefix is selected |
| 7.2 | Enter Landline Number: "3032123456" | Number is populated |
| 7.3 | Select Mobile Prefix: "+49" | Prefix is selected |
| 7.4 | Enter Mobile Number: "1501234567" | Number is populated |
| **Expected**: Phone information is complete | Both landline and mobile are filled |

### Step 8: Fill Employment Information
| Step | Action | Expected Result |
|------|--------|-----------------|
| 8.1 | Select Employment Status: "Employed" | Employed is selected |
| 8.2 | Select Nature of Business: "Finance" | Finance is selected |
| **Expected**: Employment information is filled | Both fields contain correct values |

### Step 9: Fill Financial Information
| Step | Action | Expected Result |
|------|--------|-----------------|
| 9.1 | Select Source of Funds: "Salary" | Salary is selected |
| 9.2 | Select Expected Deposit: "5000-10000" | Range is selected |
| 9.3 | Select Annual Income: "50000-100000" | Range is selected |
| 9.4 | Select Net Worth: "100000-500000" | Range is selected |
| **Expected**: Financial information is complete | All financial fields have values |

### Step 10: Fill Experience Information
| Step | Action | Expected Result |
|------|--------|-----------------|
| 10.1 | Check Seminar Experience checkbox | Checkbox is checked |
| 10.2 | Select Seminar Type: "Advanced" | Advanced is selected |
| 10.3 | Check Work Experience checkbox | Checkbox is checked |
| **Expected**: Experience information is filled | Both checkboxes are checked and dropdown selected |

### Step 11: Fill Frequency & Volume Information
| Step | Action | Expected Result |
|------|--------|-----------------|
| 11.1 | Select Frequency dropdowns: "Daily" | All frequency dropdowns show "Daily" |
| 11.2 | Select Volume dropdowns: "High" | All volume dropdowns show "High" |
| **Expected**: Frequency and volume are configured | All dropdowns have appropriate values |

### Step 12: Submit Profile Update
| Step | Action | Expected Result |
|------|--------|-----------------|
| 12.1 | Click "Update" button | Form is submitted |
| 12.2 | Wait for submission to complete | Success message appears or page reloads |
| 12.3 | Verify no error messages | No validation or system errors shown |
| **Expected**: Profile update succeeds | Success notification displayed or profile saved |

## Expected Results

### Overall Test Success Criteria:
1. ✅ New account is successfully registered with all provided data
2. ✅ User can successfully log in with newly created credentials
3. ✅ Profile page is accessible after authentication
4. ✅ All profile form fields are visible and interactive
5. ✅ All dropdown fields accept valid option selections
6. ✅ All text input fields accept valid text input
7. ✅ All checkbox fields can be checked/unchecked
8. ✅ Date field accepts properly formatted date input
9. ✅ Phone prefix selections work correctly
10. ✅ Frequency and Volume dropdowns can be filled for all items
11. ✅ Update button is clickable and functional
12. ✅ Profile submission completes without errors
13. ✅ No error messages are displayed after submission
14. ✅ User remains on profile page or receives success confirmation

## Test Automation Coverage

This test case is automated using Playwright with TypeScript and covers:
- Registration flow (data-driven testing)
- Login authentication
- Page navigation and accessibility
- Form field visibility verification
- Dropdown selection and population
- Text input validation
- Checkbox interactions
- Form submission and success verification
- Error handling and validation

## Test Execution Notes

- Test data uses unique email addresses with timestamps to allow multiple test runs
- All field validations follow IronFX business rules
- Test uses realistic profile data representative of actual user scenarios
- Automatic screenshot capture on failure for debugging
- Detailed logging at each step for audit trail
- Test can be executed for multiple countries using TEST_COUNTRY environment variable

## Related Test Cases

- TC_REGISTRATION_SUCCESS_001: Basic registration verification
- TC_LOGIN_SUCCESS_001: Login functionality verification
- TC_PROFILE_FIELD_VALIDATION_001: Individual field validation
- TC_PROFILE_ERROR_HANDLING_001: Error message verification

---

**Document Version**: 1.0
**Created Date**: 2026-01-08
**Last Modified**: 2026-01-08
**Author**: QA Automation Team
