export const isValidEmail = (email = "") => {
  const value = String(email).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
