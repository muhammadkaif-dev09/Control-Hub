import * as yup from "yup";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// Pre-calculate today's date and minAgeDate
const today = new Date();
const minAgeDate = new Date(today.setFullYear(today.getFullYear() - 18));

export const validationSchema = yup.object({
  fullName: yup
    .string()
    .required("Name is required")
    .min(2, "Name should be at least 2 characters")
    .max(20, "Name should not exceed 20 characters")
    .matches(/^[^\s].*[^\s]$/, "Name cannot start or end with a space")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces")
    .test(
      "no-only-spaces",
      "Name cannot be empty or only spaces",
      (value) => value && value.trim().length > 0
    ),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Invalid email format")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Email must include a valid domain"
    ),
  birthDate: yup
    .date()
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr))
    .required("Birthdate is required")
    .max(new Date(), "Future dates are not allowed")
    .test(
      "min-age",
      "You must be at least 18 years old",
      (value) => value && value <= minAgeDate
    ),
  gender: yup.string().required("Gender is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    ),
  confirmPassword: yup
    .string()
    .required("Confirm Password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
  phone: yup
    .mixed()
    .required("Phone number is required")
    .test("is-valid-phone", "Invalid phone number", (value) => {
      if (!value || typeof value !== "string") return false;
      const phone = parsePhoneNumberFromString(value, "IN");
      return phone ? phone.isValid() : false;
    }),
  terms: yup.boolean().oneOf([true], "Please accept the Terms and Conditions"),
});
